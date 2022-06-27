# Generated by Django 3.2.7 on 2021-09-15 14:01

import datetime
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='CutTasks',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('author_name', models.CharField(default='', max_length=254)),
                ('source_name', models.CharField(default='', max_length=254)),
                ('description', models.TextField()),
                ('dificulty', models.SmallIntegerField(default=0)),
                ('class_level', models.SmallIntegerField(default=0)),
                ('moder_comment', models.TextField(default='')),
                ('number_recheck', models.IntegerField(default=0)),
                ('tips', models.TextField()),
                ('grid', models.SmallIntegerField(default=1)),
                ('figure_cells', models.TextField()),
                ('step_logger', models.TextField()),
                ('parts', models.SmallIntegerField(default=2)),
                ('create_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('modified_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('views', models.IntegerField(default=0)),
                ('resolved', models.IntegerField(default=0)),
                ('resolved_tip1', models.IntegerField(default=0)),
                ('resolved_tip2', models.IntegerField(default=0)),
                ('resolved_tip3', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='Logs',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type_log', models.CharField(choices=[('lock', 'Заблокирован пользователь'), ('unlock', 'Разблокирован пользователь'), ('add_user', 'Добавлен пользователь'), ('delete_user', 'Удалён пользователь'), ('edit_user', 'Изменены данные пользователя'), ('edit_task', 'Изменена задача'), ('delete_task', 'Удалена задача')], db_index=True, max_length=250)),
                ('admin_name', models.CharField(db_index=True, max_length=250)),
                ('admin_id', models.IntegerField(db_index=True)),
                ('admin_role', models.CharField(choices=[('moderator', 'Модератор'), ('admin', 'Администратор')], db_index=True, max_length=250)),
                ('action_user_name', models.CharField(blank=True, db_index=True, max_length=250, null=True)),
                ('action_user_id', models.IntegerField(blank=True, db_index=True, null=True)),
                ('action_user_addition', models.TextField(blank=True, null=True)),
                ('action_task_id', models.IntegerField(blank=True, db_index=True, null=True)),
                ('edit_fields', models.TextField(blank=True, null=True)),
                ('lock_time', models.DateTimeField(default=django.utils.timezone.now)),
                ('lock_forever', models.BooleanField(default=False)),
                ('time_log', models.DateTimeField(default=django.utils.timezone.now)),
            ],
        ),
        migrations.CreateModel(
            name='Roles',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(default='', max_length=254)),
            ],
        ),
        migrations.CreateModel(
            name='TaskSource',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(default='', max_length=254)),
            ],
        ),
        migrations.CreateModel(
            name='TaskStatus',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(default='Черновик', max_length=254)),
            ],
        ),
        migrations.CreateModel(
            name='TasksFavorite',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.cuttasks')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='TaskAuthor',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(default='', max_length=254)),
                ('user', models.OneToOneField(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Session',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('create_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('reg_token', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('reg_token_time', models.DateTimeField(default=django.utils.timezone.now)),
                ('reg_time', models.DateTimeField(default=django.utils.timezone.now)),
                ('fio', models.CharField(default='', max_length=254)),
                ('email', models.CharField(max_length=254, unique=True)),
                ('pw', models.CharField(default='', max_length=254)),
                ('fail_login_count', models.SmallIntegerField(default=0)),
                ('fail_login_time', models.DateTimeField(default=django.utils.timezone.now)),
                ('active', models.BooleanField(default=True)),
                ('deleted', models.BooleanField(default=False)),
                ('additional_powers', models.CharField(choices=[('no', 'Нет'), ('moderator', 'Модератор'), ('admin', 'Администратор')], default='no', max_length=50)),
                ('is_lock', models.BooleanField(default=False)),
                ('type_lock_time', models.CharField(choices=[('no', 'Нет'), ('1d', 'День'), ('3d', '3 дня'), ('week', 'Неделя'), ('month', 'Месяц'), ('forever', 'Навсегда')], default='no', max_length=100)),
                ('lock_time', models.DateTimeField(default=datetime.datetime(2021, 9, 15, 17, 1, 51, 159845))),
                ('lock_forever', models.BooleanField(default=False)),
                ('role', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.roles')),
                ('user', models.OneToOneField(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='cuttasks',
            name='author',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.taskauthor'),
        ),
        migrations.AddField(
            model_name='cuttasks',
            name='source',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.tasksource'),
        ),
        migrations.AddField(
            model_name='cuttasks',
            name='status',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.taskstatus'),
        ),
        migrations.AddField(
            model_name='cuttasks',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='CutTaskResolves',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('step_logger', models.TextField(default='')),
                ('start_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('finish_date', models.DateTimeField(default=django.utils.timezone.now)),
                ('status', models.SmallIntegerField(default=0)),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.cuttasks')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
