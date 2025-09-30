FROM python:3.9

WORKDIR /usr/src/app

COPY requirements.txt ./

# Instala dependencias del sistema necesarias para el reconocimiento facial
RUN apt-get update && apt-get install -y cmake libdlib-dev
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD [ "python", "-u", "app.py" ]