# Generated by Django 3.2.7 on 2021-09-15 14:22

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='lock_time',
            field=models.DateTimeField(default=datetime.datetime(2021, 9, 15, 17, 22, 46, 428103)),
        ),
    ]
