# Generated by Django 4.1.7 on 2023-09-01 12:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('board', '0004_ideapin_board'),
    ]

    operations = [
        migrations.AlterField(
            model_name='uploadedmedia',
            name='file',
            field=models.FileField(upload_to=''),
        ),
    ]