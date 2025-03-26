To activate virtual env: .\cpsc419\Scripts\Activate (powershell), cpsc419\Scripts\activate(CMD), source cpsc419/bin/activate (mac/linux)

## Creation of the postgreSQL database (Haimi):
- To create the database ran: createdb -U postgres pickupdatabase - the name of the database created is pickupdatabase
- password: cpsc419
- run every psql command with the -U postgres option after typing psql to connect to the database with the superuser (postgres), then when prompted for a password, use cpsc419

## Creation of Django Project
- ran django-admin startproject pickup_sports to start the Django project. Name of the Django Project is pickup_sports
- ran python manage.py startapp scheduler to start the app within the Django project. Name of the App within the Django project is scheduler
- Django needs psycopg2 to talk to PostgreSQL. Installed psycopg2

## Superuser username: DHL
password: dhlcs419

