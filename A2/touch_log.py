import serial
import pyttsx3
import time

arduino_port = '/dev/cu.usbmodem11401'  


ser = serial.Serial(arduino_port, 9600)
engine = pyttsx3.init()

# Cooldown setup
last_spoken_time = 0
cooldown_time = 1.0  # seconds 

print("Listening to Arduino...")

while True:
    line = ser.readline().decode('utf-8', errors='ignore').strip()
    print(f"Serial: {line}")

    current_time = time.time()

    if "Touched Astraea Core!" in line:
        if current_time - last_spoken_time > cooldown_time:
            print("Speaking: Astraea Core touched")
            engine.say("This is the Astraea Core, home of the Luminaries.")
            engine.runAndWait()
            last_spoken_time = current_time

    elif "Touched Gilded Ramparts!" in line:
        if current_time - last_spoken_time > cooldown_time:
            print("Speaking: Gilded Ramparts touched")
            engine.say("This is the Gilded Ramparts, the defense wall.")
            engine.runAndWait()
            last_spoken_time = current_time

    elif "Touched Twilight Expanse!" in line:
        if current_time - last_spoken_time > cooldown_time:
            print("Speaking: Twilight Expanse touched")
            engine.say("This is the Twilight Expanse, land of the Celestials and exploration frontier.")
            engine.runAndWait()
            last_spoken_time = current_time
