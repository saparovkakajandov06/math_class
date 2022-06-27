from django.urls import path
from . import views


urlpatterns = [
    path('admin/get_users', views.admin_get_users, name='admin_get_users'),
    path('admin/add_user', views.admin_add_user, name='admin_add_user'),
    path('admin/delete_users', views.admin_delete_users, name='admin_delete_users'),
    path('admin/edit_user', views.admin_edit_user, name='admin_delete_users'),

    path('admin/get_logs', views.admin_get_logs, name='admin_get_logs'),
    path('admin/get_tasks', views.admin_get_tasks, name='admin_get_tasks'),
    path('admin/edit_task', views.admin_edit_task, name='admin_edit_task'),
    path('admin/delete_task', views.admin_delete_task, name='admin_delete_task'),
    path('admin/lock_author_task', views.admin_lock_author_task, name='admin_lock_author_task'),
    path('admin/tasks_for_check', views.admin_tasks_for_check, name='admin_tasks_for_check'),
    path('admin/confirm_reject_task', views.admin_confirm_reject_task, name='admin_confirm_reject_task'),

    path('user_is_blocked', views.user_is_blocked, name='user_is_blocked'),
    path('get_count_users_tasks', views.get_count_users_tasks, name='get_count_users_tasks'),

    path('jquery_get_authors_sources', views.jquery_get_authors_sources, name='jquery_get_authors_sources'),
    path('jquery_auth_login', views.jquery_auth_login_my, name='jquery_auth_login_my'),
    path('jquery_cut_task_save', views.jquery_cut_task_save, name='jquery_cut_task_save'),
    path('jquery_add_favorite_task', views.jquery_add_favorite_task, name='jquery_add_favorite_task'),
    path('jquery_delete_task_from_favorite', views.jquery_delete_task_from_favorite,
         name='jquery_delete_task_from_favorite'),
    path('jquery_can_user_edit_task', views.jquery_can_user_edit_task, name='jquery_can_user_edit_task'),
    path('', views.get_tasks_catalog, name='task_catalog'),


    path('get_authors_sources_roles', views.get_authors_sources_roles, name='get_authors_sources'),

    path('get_task', views.get_task, name='get_task'),
    path('get_tasks', views.get_tasks, name='get_tasks'),
    path('success_task_resolved', views.success_task_resolved, name='success_task_resolved'),
    path('sign_current_decisions_to_user', views.sign_current_decisions_to_user,
         name='sign_current_decisions_to_user'),
    path('add_favorite_task', views.add_favorite_task,
         name='add_favorite_task'),
    path('delete_task_from_favorite', views.delete_task_from_favorite, name='delete_task_from_favorite'),
    path('get_favorite_tasks', views.get_favorite_tasks, name='get_favorite_tasks'),

    path('is_authenticated_user', views.is_authenticated_user, name='is_authenticated_user'),
    path('auth_reg', views.auth_reg, name='auth_reg'),
    path('auth_reg_confirm', views.auth_reg_confirm, name='auth_reg_confirm'),
    path('auth_login', views.auth_login_my, name='auth_login_my'),
    path('auth_forget', views.auth_forget, name='auth_forget'),
    path('auth_set_new_user_pw', views.auth_set_new_user_pw, name='auth_set_new_user_pw'),
    path('auth_logout', views.auth_logout_my, name='auth_logout_my'),

    path('the_user', views.the_user, name='the_user'),
    # path('auth_user', views.auth_user, name='auth_user'),
    # path('bd_start_ceed', views.bd_start_ceed, name='bd_start_ceed'),

    # path('get_csrf_token', views.get_csrf_token, name="get_csrf_token")
]
