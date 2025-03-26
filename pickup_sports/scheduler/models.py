
# Create your models here.
from django.db import models
from django.conf import settings


from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    # Remove or repurpose the username field if you want to use email as the unique identifier.
    email = models.EmailField('email address', unique=True)
    # You can add additional fields if necessary.
    # For instance, if you want a "name" field separate from first/last names:
    name = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.email
    class Meta:
        db_table = 'users'




class Sport(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Game(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('full', 'Full'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    SKILL_LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('all', 'All Levels'),
    ]

    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_games')
    location = models.CharField(max_length=100)

    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='Participant',
        related_name='joined_games'
    )

    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='open')
    skill_level = models.CharField(
        max_length=20, choices=SKILL_LEVEL_CHOICES, default='all')
    sport = models.ForeignKey(
        Sport, on_delete=models.CASCADE, related_name='games')

    def __str__(self):
        return f"{self.sport} at {self.location} on {self.start_time.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        verbose_name_plural = "Games"
        ordering = ['start_time']


class Participant(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    game = models.ForeignKey(
        Game,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return f"{self.user.name} in {self.game}"
    
    class Meta:
        unique_together = ('user', 'game')

        # This enforces the PRIMARY KEY constraint from the SQL schema