import serial
import pyttsx3

# port shown in Arduino IDE
PORT = "/dev/cu.usbmodem11401"  # macOS 

engine = pyttsx3.init()
ser = serial.Serial(PORT, 9600)

def speak(text):
    print("/", text)
    engine.say(text)
    engine.runAndWait()

def get_zone(x, y):
    if x < 400:
        return "Left Zone"
    elif x > 600:
        return "Right Zone"
    elif y < 400:
        return "Top Zone"
    elif y > 600:
        return "Bottom Zone"
    else:
        return "Center Zone"

current_zone = ""

while True:
    line = ser.readline().decode('utf-8').strip()
    print("/", line)

    if "X:" in line and "Y:" in line:
        try:
            parts = line.split()
            x = int(parts[0].split(":")[1])
            y = int(parts[1].split(":")[1])
            btn = int(parts[2].split(":")[1])

            zone = get_zone(x, y)
            if zone != current_zone:
                speak(f"You are in the {zone}")
                current_zone = zone

            if btn == 1:
                speak(f"Selected {zone}")

        except Exception as e:
            print("Parse error:", e)
