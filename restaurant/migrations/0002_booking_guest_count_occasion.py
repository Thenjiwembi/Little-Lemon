from django.db import migrations, models
from django.core.validators import MaxValueValidator, MinValueValidator


class Migration(migrations.Migration):
    dependencies = [("restaurant", "0001_initial")]

    operations = [
        migrations.AddField(
            model_name="booking",
            name="number_of_guests",
            field=models.PositiveSmallIntegerField(
                default=2,
                validators=[MinValueValidator(1), MaxValueValidator(10)],
            ),
        ),
        migrations.AddField(
            model_name="booking",
            name="occasion",
            field=models.CharField(
                choices=[
                    ("Birthday", "Birthday"),
                    ("Anniversary", "Anniversary"),
                    ("Date night", "Date night"),
                    ("Other", "Other"),
                ],
                default="Other",
                max_length=20,
            ),
        ),
        migrations.AddConstraint(
            model_name="booking",
            constraint=models.CheckConstraint(
                check=models.Q(number_of_guests__gte=1) & models.Q(number_of_guests__lte=10),
                name="booking_guest_count_1_to_10",
            ),
        ),
    ]
