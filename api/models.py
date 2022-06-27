import datetime
import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


class Roles(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=254, default="")

    def __str__(self):
        return self.name


class Profile(models.Model):
    powers = (
        ('no', 'Нет'),
        ('moderator', 'Модератор'),
        ('admin', 'Администратор')
    )
    # Сделал choices просто для удобства
    choices_type_lock = (
        ('no', 'Нет'),
        ('1d', 'День'),
        ('3d', '3 дня'),
        ('week', 'Неделя'),
        ('month', 'Месяц'),
        ('forever', 'Навсегда'),
    )

    reg_token = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reg_token_time = models.DateTimeField(default=timezone.now)
    reg_time = models.DateTimeField(default=timezone.now)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    fio = models.CharField(max_length=254, default='')
    email = models.CharField(max_length=254, unique=True)
    pw = models.CharField(max_length=254, default='')
    fail_login_count = models.SmallIntegerField(default=0)
    fail_login_time = models.DateTimeField(default=timezone.now)
    role = models.ForeignKey(Roles, on_delete=models.SET_NULL, null=True)
    active = models.BooleanField(default=True)
    deleted = models.BooleanField(default=False)
    additional_powers = models.CharField(max_length=50, choices=powers, default='no')

    is_lock = models.BooleanField(default=False)
    # Для удоства в отображении на сколько был забанен юзер в админке(когда он всё ещё нах. в бане)
    type_lock_time = models.CharField(max_length=100, choices=choices_type_lock, default='no')
    lock_time = models.DateTimeField(default=datetime.datetime.now())  # Время бана юзера. Обращаемся к
                                                                       # нему только когда active == False
    lock_forever = models.BooleanField(default=False)  # ВЕЧНЫЙ БАН)))

    def __str__(self):
        return self.fio


class Session(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    create_date = models.DateTimeField(default=timezone.now)


class TaskStatus(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=254, default="Черновик")

    def __str__(self):
        return self.name


class TaskAuthor(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=254, default="")

    def __str__(self):
        return self.name


class TaskSource(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=254, default="")

    def __str__(self):
        return self.name


class CutTasks(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    author = models.ForeignKey(TaskAuthor, on_delete=models.SET_NULL, null=True)
    source = models.ForeignKey(TaskSource, on_delete=models.SET_NULL, null=True)
    author_name = models.CharField(max_length=254, default="")
    source_name = models.CharField(max_length=254, default="")
    description = models.TextField()
    dificulty = models.SmallIntegerField(default=0)  # уровень сложности задачи, присвоенный автором
    class_level = models.SmallIntegerField(default=0)  # классы, для которых предназначена задача

    moder_comment = models.TextField(default="")
    status = models.ForeignKey(TaskStatus, on_delete=models.SET_NULL, null=True)  # Черновик, Проверка, Опубликована...
    number_recheck = models.IntegerField(default=0)

    tips = models.TextField()  # подсказки
    grid = models.SmallIntegerField(default=1)  # тип сетки
    figure_cells = models.TextField()  # контуры фигуры
    step_logger = models.TextField()  # разрезы примера решения
    parts = models.SmallIntegerField(default=2)  # кол-во одинаковых частей в решении

    create_date = models.DateTimeField(default=timezone.now)
    modified_date = models.DateTimeField(default=timezone.now)

    views = models.IntegerField(default=0)  # кол-во просмотров задачи
    resolved = models.IntegerField(default=0)  # кол-во корректных решений
    resolved_tip1 = models.IntegerField(default=0)  # кол-во корректных решений с использованием подсказок
    resolved_tip2 = models.IntegerField(default=0)  # кол-во корректных решений
    resolved_tip3 = models.IntegerField(default=0)  # кол-во корректных решений


class TasksFavorite(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    task = models.ForeignKey(CutTasks, on_delete=models.CASCADE)


class CutTaskResolves(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    task = models.ForeignKey(CutTasks, on_delete=models.CASCADE)
    step_logger = models.TextField(default='')  # разрезы решения
    start_date = models.DateTimeField(default=timezone.now)
    finish_date = models.DateTimeField(default=timezone.now)
    status = models.SmallIntegerField(default=0)  # 0 - Не решена, 1 - Решена


class Logs(models.Model):
    types_log = (
        ('lock', 'Заблокирован пользователь'),
        ('unlock', 'Разблокирован пользователь'),
        ('add_user', 'Добавлен пользователь'),
        ('delete_user', 'Удалён пользователь'),
        ('edit_user', 'Изменены данные пользователя'),
        ('edit_task', 'Изменена задача'),
        ('delete_task', 'Удалена задача'),
    )
    powers = (
        ('moderator', 'Модератор'),
        ('admin', 'Администратор')
    )
    type_log = models.CharField(max_length=250, choices=types_log, db_index=True)

    # Да, можно было бы конечно и сделать через OneToOneField или ForeignKey, но в случае
    # если админа(или модератора) удалят, или происзойдут какие-то изменение с его акком, то в логах
    # или попросту изменится инфа, или вообще исчезнет(в случае удаления админа)
    admin_name = models.CharField(max_length=250, db_index=True)
    admin_id = models.IntegerField(db_index=True)
    admin_role = models.CharField(max_length=250, choices=powers, db_index=True)

    action_user_name = models.CharField(max_length=250, db_index=True, blank=True, null=True)
    action_user_id = models.IntegerField(db_index=True, blank=True, null=True)
    action_user_addition = models.TextField(blank=True, null=True)

    action_task_id = models.IntegerField(db_index=True, blank=True, null=True)  # Назв. задания форм. из его id

    edit_fields = models.TextField(blank=True, null=True)  # Изменённые поля задачи \ юзера, если таковы были
    lock_time = models.DateTimeField(default=timezone.now)
    lock_forever = models.BooleanField(default=False)
    time_log = models.DateTimeField(default=timezone.now)
