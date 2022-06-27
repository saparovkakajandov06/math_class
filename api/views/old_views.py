import datetime
import json

import pytz
from django.contrib.auth import authenticate, login as auth_login
from django.http import JsonResponse
from django.template.context_processors import csrf
from django.views.decorators.csrf import csrf_exempt

from api.models import TaskAuthor, TaskSource, Roles, TaskStatus, CutTasks, TasksFavorite, Profile


def the_user(request):
    user = request.user
    if user.is_anonymous:
        result = JsonResponse({'success': 'false',
                               'csrftoken': str(csrf(request)['csrf_token']),
                               'roles': jquery_get_authors_sources_roles(3),
                               'error': "Пользователь не авторизован"})
    else:
        result = JsonResponse({'success': 'true',
                               'csrftoken': str(csrf(request)['csrf_token']),
                               'user': {'fio': user.last_name},
                               'roles': jquery_get_authors_sources_roles(3),
                               'message': "Пользователь авторизован"})
    return result


def jquery_get_authors_sources(request):
    result = {
        'success': 'true',
        'authors': jquery_get_authors_sources_roles(1),
        'sources': jquery_get_authors_sources_roles(2),
        'csrftoken': str(csrf(request)['csrf_token']),
        'roles': jquery_get_authors_sources_roles(3)
    }
    user = request.user
    if user.id is not None:
        result['user'] = { 'fio': user.last_name }
    return JsonResponse(result)


def jquery_get_authors_sources_roles(author_flag):
    if author_flag == 1:
        elems = list(TaskAuthor.objects.all().order_by("name"))
    elif author_flag == 2:
        elems = list(TaskSource.objects.all().order_by("name"))
    else:
        elems = list(Roles.objects.all().exclude(name='Администратор').order_by("name"))
    jsons = []
    for elem in elems:
        json = {
            'id': elem.id,
            'name': elem.name
        }
        try:
            if elem.user_id is not None:
                json['user_id'] = elem.user_id
                json['name'] = elem.user.last_name
        except:
            all_is_good = True
        jsons.append(json)
    return jsons


def jquery_auth_login_my(request):
    user_name = request.POST.get("login")
    pw = request.POST.get("pw")
    user = authenticate(username=user_name, password=pw)
    if user is not None:
        auth_login(request, user)
        print(user)
        print(user.last_name)
        result = JsonResponse({'success': 'true',
                               'message': user.last_name + ', добро пожаловать!',
                               'user': { 'fio': user.last_name }})
    else:
        result = JsonResponse({'success': 'false',
                               'error': 'Неверные данные пользователя'})
    return result


def jquery_cut_task_save(request):
    user = request.user
    if user.is_anonymous:
        result = JsonResponse({'success': 'false',
                               'error': 'Вы не имеете прав на эту операцию. Авторизуйтесь'})
    else:
        user_profile = Profile.objects.filter(user=request.user).first()
        if user_profile is None:
            # Вообще-то всё должно быть ок
            return JsonResponse({
                'success': 'false',
                'error': 'Ваш профиль не был найден... Попробуйте выйти из аккаунта и войти снова'
            })
        if user_profile.is_lock:
            # Если юзер забанен, то на фронте у него будет отображаться мод. окно,
            # которое будет ему закрывать доступ к конструктуру, но он может его скрыть через инструменты
            # разработчика. В таком случае запрещаем ему сохранение задачи через бек, чтобы не выпендривался)))
            return JsonResponse({
                'success': 'false',
                'error': 'Не получится, вы забанены :)'
            })

        task_status = TaskStatus.objects.get(name='Проверка')
        id_current_task = int(request.POST.get('task_id'))

        author_name = request.POST.get('author')
        if author_name == '':
            author_name = user.last_name
            author_id = None
            try:
                author = TaskAuthor.objects.get(user_id=user.id)
            except:
                author = TaskAuthor.objects.create(name=author_name, user_id=user.id)
        else:
            try:
                author = TaskAuthor.objects.get(name=author_name)
            except:
                author = TaskAuthor.objects.create(name=author_name)
        author_name = author.name
        author_id = author.id
        source_name = request.POST.get('source')
        if source_name == '':
            source_id = None
        else:
            try:
                source = TaskSource.objects.get(name=source_name)
            except:
                source = TaskSource.objects.create(name=source_name)
            source_name = source.name
            source_id = source.id


        # Сохранение новой задачи
        if id_current_task == 0:
            task = CutTasks.objects.create(
                user_id=user.id,
                status_id=task_status.id,
                author_id=author_id,
                author_name=author_name,
                source_id=source_id,
                source_name=source_name,
                description=request.POST.get('description'),
                dificulty=request.POST.get('dificulty'),
                class_level=request.POST.get('class_level'),
                grid=request.POST.get('grid'),
                parts=request.POST.get('parts'),
                figure_cells=request.POST.get('figure_cells'),
                step_logger=request.POST.get('step_logger')
            )
            result = JsonResponse({'success': 'true', 'task_id': str(task.id),
                                   'message': 'Задача ' + str(task.id) + ' успешно сохранена в БД'})
        else:
            # Сохранение изменённой задачи
            task_obj = CutTasks.objects.filter(id=id_current_task).first()
            if task_obj is None:
                return JsonResponse({
                    'success': 'false',
                    'error': 'Задача не найдена... Скорее всего она была удалена.'
                })

            task_obj.status_id = task_status.id
            task_obj.author_id = author_id
            task_obj.author_name = author_name
            task_obj.source_id = source_id
            task_obj.source_name = source_name
            task_obj.description = request.POST['description']
            task_obj.dificulty = int(request.POST['dificulty'])

            task_obj.class_level = request.POST.get('class_level')
            task_obj.grid = request.POST.get('grid')[0]
            task_obj.parts = request.POST.get('parts')
            task_obj.figure_cells = request.POST['figure_cells']
            task_obj.step_logger = request.POST['step_logger']
            task_obj.modified_date = datetime.datetime.now(pytz.timezone('Europe/Moscow'))
            task_obj.moder_comment = ''

            task_obj.save()

            result = JsonResponse({'success': 'true', 'task_id': str(task_obj.id),
                                   'message': 'Задача ' + str(task_obj.id) + ' изменена и отправлена на модерацию!'})
    return result


def jquery_can_user_edit_task(request):
    id_task = request.POST.get('taskId')
    task = CutTasks.objects.filter(id=id_task, user=request.user).first()

    if task is None:
        return JsonResponse({'status': 'failed', 'message': 'Задача не найдена или у вас нет прав на её редактирование'})

    reject_status = TaskStatus.objects.get(name='Отклонено')
    if task.status != reject_status:
        return JsonResponse(
            {'status': 'failed', 'message': 'Вы не можете редактировать эту задачу.'})

    return JsonResponse({'status': 'success'})


def jquery_add_favorite_task(request):
    user = request.user
    if user.is_anonymous:
        result = JsonResponse({'success': 'false',
                               'error': 'Неавторизованные пользователи не имеют Избранного'})
    else:
        task_id = int(request.POST.get('task_id'))
        if TasksFavorite.objects.filter(user_id=user.id).filter(
                task_id=task_id).count() > 0:
            result = JsonResponse({'success': 'false',
                                   'error': 'Задача уже есть в Избранном'})
        else:
            TasksFavorite.objects.create(user_id=user.id, task_id=task_id)
            result = JsonResponse({'success': 'true', 'task_id': task_id,
                                   'message': "Задача добавлена в Избранное"})
    return result


def jquery_delete_task_from_favorite(request):
    user = request.user
    if user.is_anonymous:
        result = JsonResponse({
            'success': 'false',
            'error': 'Неавторизованные пользователи не имеют Избранного'
        })
    else:
        task_id = int(request.POST.get('task_id'))
        TasksFavorite.objects.filter(user_id=user.id).filter(
                task_id=task_id).delete()
        result = JsonResponse({
            'success': 'true', 'task_id': task_id,
            'message': "Задача удалена из Избранного"
        })
    return result
