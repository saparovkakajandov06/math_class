import json

import httplib2
import urllib
import datetime

from django.core.mail import BadHeaderError, send_mail
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.models import User
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
from django.template.context_processors import csrf
from django.middleware.csrf import get_token


from api.models import Profile, TaskStatus, CutTasks, TaskAuthor, 
    TaskSource, Roles, TasksFavorite, CutTaskResolves


def bd_start_ceed(request):
    result = JsonResponse({'success': 'true',
                           'message': "Порядок. БД засеяна начальными данными."})
    return result


def get_tasks_catalog(request):
    result = JsonResponse({'success': 'true',
                           'csrf_token': str(csrf(request)['csrf_token']),
                           'message': "Порядок."})
    return result


def auth_user(request):
    user = request.user
    if user.is_anonymous:
        try:
            user_tecman = User.objects.get(username="tecman")
            auth_login(request, user_tecman)
            result = JsonResponse({'success': 'true',
                                   'message': 'Вы авторизовались как tecman'})
        except:
            result = JsonResponse({'success': 'false',
                                   'error': "Пользователь с таким login не существует БД."})
    else:
        result = JsonResponse({'success': 'true',
                               'message': "Вы уже авторизованы"})
    return result


def get_authors_sources_roles(request):
    type_data = json.loads(request.body)['type_data']

    if type_data == 'authors':
        elems = list(TaskAuthor.objects.all().order_by("name"))
    elif type_data == 'sources':
        elems = list(TaskSource.objects.all().order_by("name"))
    elif type_data == 'roles':
        elems = list(Roles.objects.all()
                     .exclude(name='Администратор')
                     .exclude(name='Модератор')
                     .order_by("name"))

    jsons = {
        'success': 'true',
        'data': [],
        'csrf': str(csrf(request)['csrf_token']),
    }
    for elem in elems:
        json_data = {
            'id': elem.id,
            'name': elem.name
        }
        try:
            if elem.user_id is not None:
                json_data['user_id'] = elem.user_id
                json_data['name'] = elem.user.last_name
        except:
            all_is_good = True
        jsons['data'].append(json_data)

    return JsonResponse(jsons)


def get_task(request):
    user = request.user
    try:
        task = CutTasks.objects.get(id=request.POST.get('id'))
        task.views = task.views + 1
        task.save()
        task_json = {
            'id': task.id,
            'author_name': task.author_name,
            'source_name': task.source_name,
            'difficulty': task.dificulty,
            'class_level': task.class_level,
            'description': task.description,
            'grid': task.grid,
            'parts': task.parts,
            'figure_cells': task.figure_cells
        }
        resolve = CutTaskResolves.objects.create(
            user_id=user.id,
            task_id=task.id
        )
        result = JsonResponse({'success': 'true',
                               'csrf_token': str(csrf(request)['csrf_token']),
                               'resolve_id': resolve.id,
                               'task': task_json})
    except CutTasks.DoesNotExist:
        result = JsonResponse({'success': 'false',
                               'error': "Задачи " + request.POST.get('id') + " нет в БД."})
    return result


def get_tasks(request):
    page = int(request.GET.get('page'))
    limit = int(request.GET.get('limit'))
    filters = request.GET.get('filters')
    my_tasks = request.GET.get('my_tasks')
    favorite = request.GET.get('favorite')
    if request.user.is_anonymous and my_tasks is not None and favorite is not None:
        return JsonResponse({'success': 'false',
                             'error': 'Авторизуйтесь.'})
    if my_tasks is not None:
        tasks = CutTasks.objects.filter(user_id=request.user.id).order_by("-id")
    elif favorite is not None:
        # выбираем задачи, добавленные пользователем в избранное
        favorite_tasks_id = [tasks_id.task_id for tasks_id in
                             TasksFavorite.objects.filter(
                                 user_id=request.user.id,
                                 task__status__name='Опубликована'
                             )]
        tasks = CutTasks.objects.filter(
            id__in=favorite_tasks_id,
            status__name='Опубликована'
        ).order_by("-id")
    else:
        tasks = None
    if filters is None and my_tasks is None and favorite is None:
        tasks = CutTasks.objects.filter(status__name='Опубликована').order_by("-id")
    else:
        difficulty = request.GET.get('dificulty')
        if difficulty is not None:
            if tasks is None:
                tasks = CutTasks.objects.filter(status__name='Опубликована', dificulty=int(difficulty)).order_by("-id")
            else:
                tasks = tasks.filter(dificulty=int(difficulty))
        class_level = request.GET.get('class_level')
        if class_level is not None:
            if tasks is None:
                tasks = CutTasks.objects.filter(status__name='Опубликована', class_level=int(class_level)).order_by("-id")
            else:
                tasks = tasks.filter(class_level=class_level)
        author_id = request.GET.get('author_id')
        if author_id is not None:
            if tasks is None:
                tasks = CutTasks.objects.filter(status__name='Опубликована', author_id=author_id).order_by("-id")
            else:
                tasks = tasks.filter(author_id=author_id)
        else:
            user_id = request.GET.get('user_id')
            if user_id is not None:
                if tasks is None:
                    tasks = CutTasks.objects.filter(status__name='Опубликована', user_id=user_id).exclude(author_id__isnull=False).order_by("-id")
                else:
                    tasks = tasks.filter(user_id=user_id).exclude(author_id__isnull=False)
    max_page = 1 + int(tasks.count() / limit)
    if tasks.count() % limit > 0:
        max_page += 1
    tasks = tasks[page * limit:(page + 1) * limit]

    jsons = []
    for elem in tasks:
        task = {
            'id': elem.id,
            'author_name': elem.author_name,
            'source_name': elem.source_name,
            'views': elem.views,
            'resolved': elem.resolved,
            'dificulty': elem.dificulty,
            'class_level': elem.class_level,
            'description': elem.description,
            'status': elem.status.name,
            'moder_comment': elem.moder_comment
        }
        jsons.append(task)
    return JsonResponse({'success': 'true',
                         'maxPage': max_page,
                         'tasks': jsons})


def success_task_resolved(request):
    user = request.user
    try:
        attempts = int(request.POST.get('attempts'))
        task = CutTasks.objects.get(id=request.POST.get('id'))
        task.resolved = task.resolved + 1
        if attempts > 0:
            task.views = task.views + 1
        task.save()
        new_resolve = None
        try:
            resolve = CutTaskResolves.objects.get(
                id=request.POST.get('resolve_id'))
            if attempts == 0:
                resolve.status = 1
                resolve.step_logger = request.POST.get('step_logger')
                resolve.finish_date = datetime.datetime.now()
                resolve.save()
            else:
                new_resolve = CutTaskResolves.objects.create(
                    user_id=user.id,
                    task_id=task.id,
                    step_logger=request.POST.get('step_logger'),
                    start_date=resolve.start_date,
                    status=1
                )

        except:
            new_resolve = CutTaskResolves.objects.create(
                user_id=user.id,
                task_id=task.id,
                step_logger=request.POST.get('step_logger'),
                status=1
            )
        if new_resolve is None:
            result = JsonResponse({'success': 'true'})
        else:
            result = JsonResponse({'success': 'true', 'resolve_id': new_resolve.id})
    except:
        result = JsonResponse({'success': 'false',
                               'error': "Задачи " + request.POST.get('id') + " нет в БД."})
    return result


def test_mat(request):
    fio = request.POST.get('fio')
    login = request.POST.get('login')
    pw = request.POST.get('pw')
    try:
        user_id = 0
        # todo connection to auth-site
        data = {'fio': fio, 'login': login, 'pw': pw}
        body = urllib.urlencode(data)
        h = httplib2.Http()
        resp, content = h.request("https://matclass.tecman.ru/api/test_mat", method="POST",
                                  body=body)
        # if reg is success, then create new user in DB
        result = JsonResponse({'success': 'true', 'user_id': user_id,
                               'resp': resp, 'content': content})
    except:
        result = JsonResponse({'success': 'false',
                               'error': "Ошибка при подключении к сайту авторизации"})
    return result


def is_authenticated_user(request):
    if request.user.is_authenticated:
        profile_user = Profile.objects.get(user=request.user)
        data = {
            'status': True,
            'fio': profile_user.fio,
            'powers': profile_user.additional_powers
        }
    else:
        data = {'status': False, 'fio': 'Авторизоваться', 'powers': 'no'}

    return JsonResponse(data)


def auth_reg(request):
    fio = json.loads(request.body)['fio']
    login = json.loads(request.body)['login']
    role_id = int(json.loads(request.body)['roleId'])
    pw = json.loads(request.body)['pw']

    if len(pw) < 6 or len(login) < 5 or len(fio) < 3:
        result = JsonResponse({'success': 'false',
                               'error': "Ошибка во входящих данных"})
    else:
        try:
            prof_user = Profile.objects.get(email=login)
            result = JsonResponse({'success': 'false',
                                   'error': "Пользователь с таким e-mail уже есть в БД"})
            # todo connection to auth-site
        #        data = {'fio': fio, 'login': login, 'pw': pw}
        #       body = urllib.urlencode(data)
        #      h = httplib2.Http()
        #     resp, content = h.request("https://matclass.tecman.ru/api/test_mat", method="POST",
        #                              body=body)
        except:
            prof_user = Profile.objects.create(
                fio=fio,
                role_id=role_id,
                email=login,
                pw=pw
            )
            subject = 'Регистрация в Маткласс'
            message = 'Для подтверждения регистрации пройдите по ссылке (' + settings.APPLICATION_HOST + \
                      'auth_reg_confirm?reg_token=' + str(prof_user.reg_token) + ')\n\nСсылка действительна 10 минут.'
            try:
                send_mail(subject, message,
                          'Маткласс <' + settings.EMAIL_HOST_USER + '>', [
                              login])  # , reply_to=['igor138@rambler.ru'], headers=headers)
                result = JsonResponse(
                    {'success': 'true',
                     'message': "На указанный e-mail отправлено письмо.<br>"
                                "Для подтверждения регистрации<br>пройдите по ссылке в нем."})
            # except BadHeaderError:
            except Exception as e:
                print('error in send email', e)
                result = {'success': 'false', 'error': "Не удалось отправить письмо"}
    return result


def auth_reg_confirm(request):
    reg_token = request.GET.get('reg_token')

    try:
        user_profile = Profile.objects.get(reg_token=reg_token)
        if user_profile.user is not None:
            result = JsonResponse({'success': 'false',
                                   'error': "Регистрация уже была подтверждена.\
                                    Авторизуйтесь."})
        elif minutes(user_profile.reg_token_time, datetime.datetime.utcnow()) > 10:
            user_profile.delete()
            result = JsonResponse({'success': 'false',
                                   'error': "Время жизни токена регистрации истекло.\
                                    Попробуйте зарегистрироваться ещё раз."})
        else:
            user = User.objects.create_user(username=user_profile.email, email=user_profile.email,
                                            password=user_profile.pw,
                                            is_staff=True,
                                            first_name=user_profile.fio,
                                            last_name=user_profile.fio
                                            )
            user_profile.pw = ''
            user_profile.user_id = user.id
            user_profile.save()
            user_profile.user.save()
            auth_login(request, user)
            result = JsonResponse({'success': 'true', 'message': 'E-mail подтвержден',
                                   'user': {'fio': user_profile.fio}})
    except:
        result = JsonResponse({'success': 'false',
                               'error': "Токен регистрации не найден. \
                  Попробуйте зарегистрироваться ещё раз."})
    return result


def auth_login_my(request):
    login = json.loads(request.body)['login']
    pw = json.loads(request.body)['pw']

    user = authenticate(username=login, password=pw)
    if user is None:
        result = JsonResponse({'success': 'false',
                               'error': 'Неверные данные пользователя'})
    else:
        auth_login(request, user)
        print(request.user)

        result = JsonResponse({'success': 'true',
                               'message': user.last_name + ', добро пожаловать!',
                               'user'
                               'session_id': str(request.session.session_key)})
    return result


def auth_forget(request):
    login = json.loads(request.body)['login']

    try:
        user_profile = Profile.objects.get(email=login)
        user_profile.pw = User.objects.make_random_password(length=40,
                                                            allowed_chars='123456789qwertyuioasdfghjklZXCDFGTYU')
        user_profile.reg_token_time = datetime.datetime.now()
        subject = 'Восстановление пароля от ЛК в Маткласс'
        message = 'Для изменения пароля пройдите по ссылке (' + \
                  settings.APPLICATION_HOST + 'auth_forget_confirm?temp=' + user_profile.pw + \
                  ')\n\nСсылка действительна 10 минут.\n\n' + \
                  'Если Вы не запрашивали смену пароля, просто удалите это письмо'
        try:
            send_mail(subject, message,
                      'Маткласс <' + settings.EMAIL_HOST_USER + '>', [
                          login])  # , reply_to=['igor138@rambler.ru'], headers=headers)
            user_profile.save()
            result = JsonResponse(
                {'success': 'true',
                 'message': "На Ваш e-mail отправлено письмо<br>с инструкцией для смены пароля."})
        except BadHeaderError:
            result = {'success': 'false',
                      'error': "Не удалось отправить письмо"}
    except:
        result = JsonResponse({'success': 'false',
                               'error': "Указанный e-mail не найден в БД"})
    return result


def auth_set_new_user_pw(request):
    temp = request.POST.get('temp')
    new_pw = request.POST.get('new_pw')
    try:
        user_profile = Profile.objects.get(pw=temp)
        if (minutes(user_profile.reg_token_time,
                    datetime.datetime.utcnow()) > 10):
            result = JsonResponse({'success': 'false',
                                   'error': "Время жизни ссылки истекло.\
                                            Запросите восстановление пароля ещё раз."})
        else:
            user_profile.pw = ''
            user_profile.user.set_password(new_pw)
            user_profile.save()
            user_profile.user.save()
            auth_login(request, user_profile.user)
            result = JsonResponse({'success': 'true', 'message': 'Пароль изменен',
                                   'user': {'fio': user_profile.fio}})
    except:
        result = JsonResponse({'success': 'false',
                               'error': "Неверные данные пользователя"})
    return result


def auth_logout_my(request):
    auth_logout(request)
    return JsonResponse({'success': 'true',
                         'message': "Вышли из ЛК"})


def get_favorite_tasks(request):
    user = request.user
    if user.is_anonymous:
        data = {'success': 'false',
                'error': 'Неавторизованные пользователи не имеют Избранного'}
    else:
        jsons = []
        for elem in TasksFavorite.objects.filter(user_id=user.id):
            print(elem)
            task = {
                'id': elem.task_id
            }
            jsons.append(task)
        data = {'success': 'true',
                'message': "Список избранных задач пользователя",
                'tasks': jsons}
    return JsonResponse(data)


def add_favorite_task(request):
    user = request.user
    if user.is_anonymous:
        result = JsonResponse({'success': 'false',
                               'error': 'Неавторизованные пользователи не имеют Избранного'})
    else:
        task_id = json.loads(request.body)['taskId']
        if TasksFavorite.objects.filter(user_id=user.id).filter(
                task_id=task_id).count() > 0:
            result = JsonResponse({'success': 'false',
                                   'error': 'Задача уже есть в Избранном'})
        else:
            TasksFavorite.objects.create(user_id=user.id, task_id=task_id)
            result = JsonResponse({'success': 'true', 'task_id': task_id,
                                   'message': "Задача добавлена в Избранное"})
    return result


def delete_task_from_favorite(request):
    user = request.user
    if user.is_anonymous:
        result = JsonResponse({'success': 'false',
                               'error': 'Неавторизованные пользователи не имеют Избранного'})
    else:
        task_id = json.loads(request.body)['taskId']
        TasksFavorite.objects.filter(user_id=user.id).filter(
            task_id=task_id).delete()
        result = JsonResponse({'success': 'true', 'task_id': task_id,
                               'message': "Задача удалена из Избранного"})
    return result


def sign_current_decisions_to_user(request):
    user = request.user
    result = JsonResponse({'success': 'true'})
    for resolve_id in request.POST.get('resolves_id').split(','):
        try:
            resolve = CutTaskResolves.objects.get(id=resolve_id)
            if resolve.user_id is None:
                resolve.user_id = user.id
                resolve.save()
        except:
            result = JsonResponse({'success': 'false',
                                   'error': 'Попытка приписать пользователю несуществующий вариант решения задачи'})
    return result


def minutes(token_time, now):
    res = (now.year - token_time.year) * 365 * 24 * 60
    res += (now.day - token_time.day) * 24 * 60
    res += (now.hour - token_time.hour) * 60
    res += now.minute - token_time.minute
    return res


# Отправляется на странице конструктора для проверки забанен ли юзер.
def user_is_blocked(request):
    if request.user.is_anonymous:
        return JsonResponse({
            'status': 'success',
            'lock': False,
            'time_lock': ''
        })

    user_profile = Profile.objects.filter(user=request.user).first()
    if user_profile is None:
        return JsonResponse({'status': 'failed'})

    data = {
        'status': 'success',
        'lock': False,
        'time_lock': ''
    }
    if user_profile.is_lock:
        data['lock'] = True
        if user_profile.lock_forever:
            data['time_lock'] = 'навсегда'
        else:
            data['time_lock'] = 'до ' + user_profile.lock_time.strftime('%d.%m.%Y')
    return JsonResponse(data)
