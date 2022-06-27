from django.contrib import admin

from .models import Roles, Profile, CutTasks, TaskStatus, TaskAuthor, TaskSource, CutTaskResolves, Logs


@admin.register(Roles)
class RolesAdmin(admin.ModelAdmin):
    list_display = ('id', 'name',)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'fio', 'role', 'active', 'deleted')
    search_fields = ('fio',)


@admin.register(CutTasks)
class CutTasksAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'create_date', 'status', 'views', 'resolved', 'dificulty', 'class_level')


@admin.register(CutTaskResolves)
class CutTaskResolvesAdmin(admin.ModelAdmin):
    list_display = ('id', 'task', 'user')


@admin.register(TaskStatus)
class TaskStatusAdmin(admin.ModelAdmin):
    list_display = ('name',)


@admin.register(TaskAuthor)
class TaskAuthorAdmin(admin.ModelAdmin):
    list_display = ('user', 'name',)


@admin.register(TaskSource)
class TaskSourceAdmin(admin.ModelAdmin):
    list_display = ('name',)


@admin.register(Logs)
class LogsAdmin(admin.ModelAdmin):
    list_display = ('time_log', 'type_log')

