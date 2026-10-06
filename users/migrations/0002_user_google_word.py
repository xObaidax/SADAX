from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="google_id",
            field=models.CharField(blank=True, max_length=128, null=True, unique=True),
        ),
        migrations.AddField(
            model_name="user",
            name="avatar_url",
            field=models.URLField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="user",
            name="last_login_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.CreateModel(
            name="Word",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("french", models.CharField(max_length=200)),
                ("arabic", models.CharField(max_length=200)),
                ("category", models.CharField(blank=True, max_length=100)),
                ("mastery_level", models.IntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("client_id", models.CharField(blank=True, max_length=128)),
                ("set_id", models.CharField(blank=True, max_length=128)),
                ("set_name", models.CharField(blank=True, max_length=200)),
                ("source_language", models.CharField(default="fr", max_length=16)),
                ("target_language", models.CharField(default="ar", max_length=16)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="words", to="users.user")),
            ],
        ),
        migrations.AddConstraint(
            model_name="word",
            constraint=models.UniqueConstraint(
                fields=("user", "client_id"),
                condition=~models.Q(client_id=""),
                name="unique_user_word_client_id",
            ),
        ),
    ]
