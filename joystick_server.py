import asyncio
import serial
import websockets
import json
import serial.tools.list_ports


def reconnect_serial():
    ports = list(serial.tools.list_ports.comports())
    for p in ports:
        if "usbmodem" in p.device or "usbserial" in p.device:
            try:
                return serial.Serial(p.device, 9600)
            except:
                continue
    return None


ser = reconnect_serial()
if not ser:
    print("No Arduino found")


# Parse serial lines: X:512 Y:512 BTN:0
def parse_line(line):
    try:
        parts = line.decode().strip().split()
        return {
            "x": int(parts[0].split(":")[1]),
            "y": int(parts[1].split(":")[1]),
            "btn": int(parts[2].split(":")[1])
        }
    except:
        return None
        
async def send_data(websocket):
    global ser
    while True:
        try:
            if not ser or not ser.is_open:
                print("Attempting to reconnect")
                ser = reconnect_serial()
                await asyncio.sleep(1)
                continue

            line = ser.readline()
            data = parse_line(line)
            if data:
                await websocket.send(json.dumps(data))
            await asyncio.sleep(0.02)
        except (serial.SerialException, OSError) as e:
            print("Serial error:", e)
            if ser:
                ser.close()
                ser = None
            await asyncio.sleep(1)
        except websockets.exceptions.ConnectionClosedOK:
            print("WebSocket disconnected.")
            break
        except Exception as e:
            print("Error in send_data:", e)
            await asyncio.sleep(1)


async def handler(websocket):
    await send_data(websocket)

async def main():
    async with websockets.serve(handler, "localhost", 8765):
        print("WebSocket server running on ws://localhost:8765")
        await asyncio.Future()  

asyncio.run(main())

