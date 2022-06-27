import datetime
import json

from django.contrib.auth.models import User
from django.core.paginator import Paginator
from django.http import JsonResponse

from api.models import Profile, CutTasks, TaskAuthor, TaskStatus, Logs

class_levels = {
    0: 'Не выбрано',
    1: '1-3',
    2: '4-6',
    3: '7-9',
    4: '10-11'
}


# Декоратор проверки является ли юзер админом. Если нет, то ничего не делаем и просто выкидываем ему ошибку.
def is_admin(func):
    def wrapper(*args, **kwargs):
        request = args[0]

        if request.user.is_anonymous:
            # anon
            return JsonResponse({'status': 'failed'})
        current_user = Profile.objects.get(user=request.user)
        if current_user is None or current_user.additional_powers != 'admin':
            # not anon, but don't have permissions
            return JsonResponse({'status': 'failed'})
        # everything is fine
        return func(*args, **kwargs)

    return wrapper


# Аналогично, что и выше, но юзер может или админом, или модератором
def is_admin_or_moderator(func):
    def wrapper(*args, **kwargs):
        request = args[0]

        if request.user.is_anonymous:
            # anon
            return JsonResponse({'status': 'failed'})
        current_user = Profile.objects.get(user=request.user)
        if current_user is None or \
                (current_user.additional_powers != 'admin' and current_user.additional_powers != 'moderator'):
            # not anon, but don't have permissions
            return JsonResponse({'status': 'failed'})
        # everything is fine
        return func(*args, **kwargs)

    return wrapper


@is_admin
def admin_get_users(request):
    users = {'status': 'success', 'data': []}
    for user in Profile.objects.all():
        try:
            user_json = {
                'id': user.user.id,
                'fio': user.fio,
                'email': user.email,
                'role_key': user.role.id,
                'role_str': user.role.name,
                'powers_key': user.additional_powers,
                'powers_str': user.get_additional_powers_display(),
                'date_reg': user.user.date_joined.strftime('%d.%m.%Y'),
                'lock': user.is_lock,
                'type_lock_time': user.type_lock_time,
                'lock_time': user.lock_time.strftime('%d.%m.%Y'),
                'lock_forever': user.lock_forever
            }
        except AttributeError:
            continue
        users['data'].append(user_json)
    return JsonResponse(users)


@is_admin
def admin_add_user(request):
    user_data = json.loads(request.body)['user']

    profile_user = Profile.objects.filter(email=user_data['email']).first()
    if profile_user is not None:
        data = {'status': 'failed',
                'error': "Пользователь с таким e-mail уже есть в БД"}
    else:
        profile_user = Profile.objects.create(
            fio=user_data['fio'],
            role_id=user_data['role'],
            email=user_data['email'],
            additional_powers=user_data['power']
        )
        user = User.objects.create_user(
            username=user_data['email'],
            email=user_data['email'],
            password=user_data['password'],
            is_staff=True,
            first_name=user_data['fio'],
            last_name=user_data['fio']
        )
        profile_user.user_id = user.id
        profile_user.save()
        profile_user.user.save()

        admin_profile = Profile.objects.filter(user=request.user).first()
        Logs.objects.create(
            type_log='add_user',
            admin_name=request.user.last_name,
            admin_role=admin_profile.get_additional_powers_display(),
            admin_id=admin_profile.user_id,
            action_user_id=profile_user.user_id,
            action_user_name=profile_user.fio,
            action_user_addition=f'({profile_user.role.name}'
                                 f'{" - " + profile_user.get_additional_powers_display() if profile_user.additional_powers != "no" else ""})'
        )

        data = {'status': 'success'}

    return JsonResponse(data)


@is_admin
def admin_delete_users(request):
    users_id = json.loads(request.body)['users']
    for user in users_id:
        user_object = User.objects.filter(id=user).first()
        user_profile = Profile.objects.filter(user=user_object).first()
        if user_object is not None and user_profile is not None:
            admin_profile = Profile.objects.filter(user=request.user).first()
            # Логирование удаления юзера
            Logs.objects.create(
                type_log='delete_user',
                admin_name=admin_profile.fio,
                admin_role=admin_profile.get_additional_powers_display(),
                admin_id=admin_profile.user_id,
                action_user_id=user_object.id,
                action_user_name=user_object.last_name,
                action_user_addition=f'({user_profile.role.name}'
                                     f'{" - " + user_profile.get_additional_powers_display() if user_profile.additional_powers != "no" else ""})'
            )
            user_object.delete()
        else:
            return JsonResponse({'status': 'failed'})

    return JsonResponse({'status': 'success'})


@is_admin
def admin_edit_user(request):
    user_json = json.loads(request.body)['user']

    admin_profile = Profile.objects.filter(user=request.user).first()
    user = User.objects.filter(id=user_json['user_id']).first()
    user_profile = Profile.objects.filter(user=user).first()
    if user is None or user_profile is None:
        return JsonResponse({'status': 'failed', 'message': 'Пользователь не найден. Скорее всего он был удалён.'})

    check_availability_email = User.objects.filter(email=user_json['user_email']).first()
    if user_json['user_email'] != user.email and check_availability_email is not None:
        return JsonResponse({'status': 'failed', 'message': 'Этот Email уже занят'})

    user_profile.user.first_name = user_json['user_fio'].strip()
    user_profile.user.last_name = user_json['user_fio'].strip()
    user_profile.user.username = user_json['user_email'].strip()
    user_profile.user.email = user_json['user_email'].strip()

    user_profile.fio = user_json['user_fio'].strip()
    user_profile.email = user_json['user_email'].strip()
    user_profile.role_id = user_json['user_role']
    if user_json['user_role'] == '1':  # Ученик
        user_profile.additional_powers = 'no'
    else:
        user_profile.additional_powers = user_json['user_powers']

    Logs.objects.create(
        type_log='edit_user',
        admin_name=request.user.last_name,
        admin_role=admin_profile.get_additional_powers_display(),
        admin_id=admin_profile.user_id,
        action_user_id=user_profile.user_id,
        action_user_name=user_profile.fio,
        action_user_addition=f'({user_profile.role.name}'
                             f'{" - " + user_profile.get_additional_powers_display() if user_profile.additional_powers != "no" else ""})'
    )

    # Если юзера забанили, и при этом ранее он не был забанен(то есть значение изменилось)
    if user_json['user_lock'] and not user_profile.is_lock:
        # Логирование бана
        log_ban = Logs.objects.create(
            type_log='lock',
            admin_name=request.user.last_name,
            admin_role=admin_profile.get_additional_powers_display(),
            admin_id=admin_profile.user_id,
            action_user_id=user_profile.user_id,
            action_user_name=user_profile.fio,
            action_user_addition=f'({user_profile.role.name}'
                                 f'{" - " + user_profile.get_additional_powers_display() if user_profile.additional_powers != "no" else ""})'
        )
        user_profile.is_lock = True
        today = datetime.datetime.now()
        if user_json['user_type_lock_time'] == 'forever':
            user_profile.lock_forever = True
            log_ban.lock_forever = True
            log_ban.save()
        elif user_json['user_type_lock_time'] == '1d':
            user_profile.lock_time = today + datetime.timedelta(days=1)
            user_profile.lock_forever = False
            log_ban.lock_time = today + datetime.timedelta(days=1)
            log_ban.save()
        elif user_json['user_type_lock_time'] == '3d':
            user_profile.lock_time = today + datetime.timedelta(days=3)
            user_profile.lock_forever = False
            log_ban.lock_time = today + datetime.timedelta(days=3)
            log_ban.save()
        elif user_json['user_type_lock_time'] == 'week':
            user_profile.lock_time = today + datetime.timedelta(days=7)
            user_profile.lock_forever = False
            log_ban.lock_time = today + datetime.timedelta(days=7)
            log_ban.save()
        elif user_json['user_type_lock_time'] == 'month':
            user_profile.lock_time = today + datetime.timedelta(days=30)
            user_profile.lock_forever = False
            log_ban.lock_time = today + datetime.timedelta(days=30)
            log_ban.save()
    elif not user_json['user_lock'] and user_profile.is_lock:
        user_profile.is_lock = False
        user_profile.lock_forever = False

        # Логирование разбана
        log_ban = Logs.objects.create(
            type_log='unlock',
            admin_name=request.user.last_name,
            admin_role=admin_profile.get_additional_powers_display(),
            admin_id=admin_profile.user_id,
            action_user_id=user_profile.user_id,
            action_user_name=user_profile.fio,
            action_user_addition=f'({user_profile.role.name}'
                                 f'{" - " + user_profile.get_additional_powers_display() if user_profile.additional_powers != "no" else ""})'
        )

    user_profile.save()
    user_profile.user.save()

    data = {'status': 'success'}
    return JsonResponse(data)


@is_admin_or_moderator
def admin_get_tasks(request):
    page_number = json.loads(request.body)['page']
    tasks = CutTasks.objects.all().order_by('-modified_date')
    paginator = Paginator(tasks, 25)
    page_tasks = paginator.get_page(page_number)

    data_tasks = []
    for task in page_tasks:
        task_object = {
            'id': task.id,
            'author': task.author_name,
            'real_creator': task.user.first_name if task.user else None,
            'author_id': task.user.id if task.user else None,
            'difficulty': task.dificulty,
            'class_level_key': task.class_level,
            'class_level': class_levels[task.class_level],
            'source': task.source_name,
            'create_date': task.create_date.strftime('%d.%m.%Y'),
            'create_time': task.create_date.strftime('%H:%M'),
            'description': task.description,
            'number_recheck': task.number_recheck,
            'status': task.status.name
        }
        data_tasks.append(task_object)

    return JsonResponse({'status': 'success', 'count_pages': paginator.num_pages, 'tasks': data_tasks})


@is_admin_or_moderator
def admin_edit_task(request):
    task = json.loads(request.body)['task']
    task_obj = CutTasks.objects.filter(id=task['id']).first()
    if task_obj is None:
        return JsonResponse({'status': 'failed'})

    task_author = TaskAuthor.objects.filter(name=task['author']).first()
    if task_author is None:
        author = TaskAuthor.objects.create(name=task['author'])
        task_obj.author_name = author.name
        task_obj.author_id = author.id
    else:
        task_obj.author_name = task['author']

    task_obj.source_name = task['source']
    task_obj.dificulty = task['difficulty']
    task_obj.class_level = task['class_level_key']
    task_obj.description = task['description']

    if 'status' in task:
        status_obj = TaskStatus.objects.get(name=task['status'])
        task_obj.status_id = status_obj.id

    admin_profile = Profile.objects.filter(user=request.user).first()
    Logs.objects.create(
        type_log='edit_task',
        admin_name=request.user.last_name,
        admin_role=admin_profile.get_additional_powers_display(),
        admin_id=admin_profile.user_id,
        action_task_id=task_obj.id
    )

    task_obj.save()

    return JsonResponse({'status': 'success'})


@is_admin_or_moderator
def admin_delete_task(request):
    task_id = json.loads(request.body)['taskId']
    task = CutTasks.objects.filter(id=task_id).first()
    if task is None:
        return JsonResponse({'status': 'failed'})

    admin_profile = Profile.objects.filter(user=request.user).first()
    Logs.objects.create(
        type_log='delete_task',
        admin_name=request.user.last_name,
        admin_role=admin_profile.get_additional_powers_display(),
        admin_id=admin_profile.user_id,
        action_task_id=task.id
    )

    task.delete()

    return JsonResponse({'status': 'success'})


@is_admin_or_moderator
def admin_lock_author_task(request):
    task_id = json.loads(request.body)['taskId']
    user_id = json.loads(request.body)['userId']
    time_lock = json.loads(request.body)['timeLock']

    task = CutTasks.objects.filter(id=task_id).first()
    user = Profile.objects.filter(user_id=user_id).first()

    if task is None or user is None:
        return JsonResponse({'status': 'failed'})

    task.delete()

    admin_profile = Profile.objects.filter(user=request.user).first()
    # Логирование бана
    log_ban = Logs.objects.create(
        type_log='lock',
        admin_name=request.user.last_name,
        admin_role=admin_profile.get_additional_powers_display(),
        admin_id=admin_profile.user_id,
        action_user_id=user.user_id,
        action_user_name=user.fio,
        action_user_addition=f'({user.role.name}'
                             f'{" - " + user.get_additional_powers_display() if user.additional_powers != "no" else ""})'
    )
    user.is_lock = True
    today = datetime.datetime.now()
    if time_lock == 'forever':
        user.lock_forever = True
        log_ban.lock_forever = True
        log_ban.save()
    elif time_lock == '1d':
        user.lock_time = today + datetime.timedelta(days=1)
        user.lock_forever = False
        log_ban.lock_time = today + datetime.timedelta(days=1)
        log_ban.save()
    elif time_lock == '3d':
        user.lock_time = today + datetime.timedelta(days=3)
        user.lock_forever = False
        log_ban.lock_time = today + datetime.timedelta(days=3)
        log_ban.save()
    elif time_lock == 'week':
        user.lock_time = today + datetime.timedelta(days=7)
        user.lock_forever = False
        log_ban.lock_time = today + datetime.timedelta(days=7)
        log_ban.save()
    elif time_lock == 'month':
        user.lock_time = today + datetime.timedelta(days=30)
        user.lock_forever = False
        log_ban.lock_time = today + datetime.timedelta(days=30)
        log_ban.save()
    user.save()

    return JsonResponse({'status': 'success'})


@is_admin_or_moderator
def admin_tasks_for_check(request):
    page = json.loads(request.body)['page']
    tasks = CutTasks.objects.filter(status__name='Проверка').order_by('-modified_date')

    paginator_tasks = Paginator(tasks, 25)
    page_tasks = paginator_tasks.get_page(page)

    tasks_json = []

    for task in page_tasks:
        task_json = {
            'id': task.id,
            'author': task.author_name,
            'author_id': task.user_id,
            'real_creator': task.user.first_name,
            'source': task.source_name,
            'description': task.description,
            'difficulty': task.dificulty,
            'class_level': class_levels[task.class_level],
            'class_level_key': task.class_level,
            'modified_date': task.modified_date.strftime('%d.%m.%Y'),
            'modified_time': task.modified_date.strftime('%H:%M'),
            'number_recheck': task.number_recheck
        }
        tasks_json.append(task_json)

    return JsonResponse({'status': 'success', 'count_pages': paginator_tasks.num_pages, 'tasks': tasks_json})


@is_admin_or_moderator
def admin_confirm_reject_task(request):
    task_id = json.loads(request.body)['taskId']
    type_action = json.loads(request.body)['typeAction']
    moder_comment = json.loads(request.body)['moderComment']

    confirm_status = TaskStatus.objects.get(name='Опубликована')
    reject_status = TaskStatus.objects.get(name='Отклонено')

    task = CutTasks.objects.filter(id=task_id).first()
    if task is None:
        return JsonResponse({'status': 'failed'})

    task.moder_comment = moder_comment
    if type_action == 'confirm':
        task.status_id = confirm_status.id
    elif type_action == 'reject':
        task.status_id = reject_status.id
        task.number_recheck += 1
    task.save()

    return JsonResponse({'status': 'success'})


@is_admin
def admin_get_logs(request):
    page = json.loads(request.body)['page']
    is_only_last_logs = json.loads(request.body)['onlyLastLogs']

    send_logs = []
    all_logs = Logs.objects.all().order_by('-time_log')

    count_pages = None
    if is_only_last_logs:
        for log in all_logs[:5]:
            send_logs.append({
                'id': log.pk,
                'date': log.time_log.strftime('%d.%m.%Y'),
                'time': log.time_log.strftime('%H:%M'),
                'admin_name': log.admin_name,
                'admin_id': log.admin_id,
                'admin_powers': log.admin_role,
                'action': {
                    'type_log': log.type_log,
                    'message': log.get_type_log_display(),
                    'user_name': log.action_user_name,
                    'user_id': log.action_user_id,
                    'user_addition': log.action_user_addition,
                    'task_id': log.action_task_id,
                    'lock_forever': log.lock_forever,
                    'lock_time': log.lock_time.strftime('%d.%m.%Y'),
                }
            })
    else:
        paginator = Paginator(all_logs, 25)
        count_pages = paginator.num_pages
        for log in paginator.get_page(page):
            send_logs.append({
                'id': log.pk,
                'date': log.time_log.strftime('%d.%m.%Y'),
                'time': log.time_log.strftime('%H:%M'),
                'admin_name': log.admin_name,
                'admin_id': log.admin_id,
                'admin_powers': log.admin_role,
                'action': {
                    'message': log.get_type_log_display(),
                    'user_name': log.action_user_name,
                    'user_id': log.action_user_id,
                    'task_id': log.action_task_id,
                    'lock_forever': log.lock_forever,
                    'lock_time': log.lock_time.strftime('%d.%m.%Y'),
                }
            })

    return JsonResponse({'status': 'success', 'count_pages': count_pages, 'logs': send_logs})


@is_admin
def get_count_users_tasks(request):
    all_users = 0
    for profile in Profile.objects.all():
        if profile.user:
            all_users += 1

    admins = 0
    for profile in Profile.objects.filter(additional_powers='admin'):
        if profile.user:
            admins += 1

    moderators = 0
    for profile in Profile.objects.filter(additional_powers='moderator'):
        if profile.user:
            moderators += 1

    teachers = 0
    for profile in Profile.objects.filter(role__name='Преподаватель', additional_powers='no'):
        if profile.user:
            teachers += 1

    students = 0
    for profile in Profile.objects.filter(role__name='Ученик'):
        if profile.user:
            students += 1

    task_status = TaskStatus.objects.get(name='Проверка')
    all_tasks = CutTasks.objects.all().count()
    new_tasks = CutTasks.objects.filter(status=task_status).count()
    return JsonResponse({
        'status': 'success',
        'data': {
            'all_users': all_users,
            'admins': admins,
            'moderators': moderators,
            'teachers': teachers,
            'students': students,
            'all_tasks': all_tasks,
            'new_tasks': new_tasks
        }
    })


# def test(request):
#     all_tasks = CutTasks.objects.all()
#
#     drift = TaskStatus.objects.get(name='Черновик')
#     check = TaskStatus.objects.get(name='Проверка')
#     recheck = TaskStatus.objects.get(name='Повторная проверка')
#     published = TaskStatus.objects.get(name='Опубликована')
#
#     for task in all_tasks:
#         if task.id == drift.id:
#             task.status_id = published.id
#         task.save()
