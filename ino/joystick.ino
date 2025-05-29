const int VRx = A0; 
const int VRy = A1;
const int SW = 2;

const int threshold = 20; // joystick's sensitivity
int prevX = 0;
int prevY = 0;
int prevBtn = 0;

void setup() {
  pinMode(SW, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  int x = analogRead(VRx);
  int y = analogRead(VRy);
  int btn = digitalRead(SW) == LOW ? 1 : 0;

  if (abs(x - prevX) > threshold || abs(y - prevY) > threshold || btn != prevBtn) {
    Serial.print("X:");
    Serial.print(x);
    Serial.print(" Y:");
    Serial.print(y);
    Serial.print(" BTN:");
    Serial.println(btn);

    if (btn == 1 && prevBtn == 0) {
      Serial.println("Button Pressed!");
    }

    prevX = x;
    prevY = y;
    prevBtn = btn;
  }

  delay(200); // decrease for faster response
}
