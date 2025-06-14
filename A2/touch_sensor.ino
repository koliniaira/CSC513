#include <CapacitiveSensor.h>

// Define CapacitiveSensor instances
CapacitiveSensor cs_4_2 = CapacitiveSensor(4, 2);  // Astraea Core
CapacitiveSensor cs_7_3 = CapacitiveSensor(7, 3);  // Gilded Ramparts
CapacitiveSensor cs_8_5 = CapacitiveSensor(8, 5);  // Twilight Expanse

void setup() {
  Serial.begin(9600);

  // Disable auto calibration for stability
  cs_4_2.set_CS_AutocaL_Millis(0xFFFFFFFF);
  cs_7_3.set_CS_AutocaL_Millis(0xFFFFFFFF);
  cs_8_5.set_CS_AutocaL_Millis(0xFFFFFFFF);
}

void loop() {
  // Read capacitance values for each zone
  long sensorValue1 = cs_4_2.capacitiveSensor(30);
  long sensorValue2 = cs_7_3.capacitiveSensor(30);
  long sensorValue3 = cs_8_5.capacitiveSensor(30);

  // Print all values  
  Serial.print("Astraea: ");
  Serial.print(sensorValue1);
  Serial.print(" | Gilded: ");
  Serial.print(sensorValue2);
  Serial.print(" | Twilight: ");
  Serial.println(sensorValue3);

  // Zone 1 — Astraea Core
  if (sensorValue1 > 500) {
    Serial.println("Touched Astraea Core!");
  }

  // Zone 2 — Gilded Ramparts
  if (sensorValue2 > 500) {
    Serial.println("Touched Gilded Ramparts!");
  }

  // Zone 3 — Twilight Expanse
  if (sensorValue3 > 500) {
    Serial.println("Touched Twilight Expanse!");
  }

  delay(100);  // Small delay between readings
}
