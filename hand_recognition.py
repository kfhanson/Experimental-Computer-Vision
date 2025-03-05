import cv2
import mediapipe as mp

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,  # Set to True for static images, False for video stream
    max_num_hands=2,         # Maximum number of hands to detect
    min_detection_confidence=0.5, # Minimum confidence for hand detection
    min_tracking_confidence=0.5  # Minimum confidence for landmark tracking
)
mp_drawing = mp.solutions.drawing_utils  # For drawing landmarks on the image
cap = cv2.VideoCapture(0)

while cap.isOpened():
    success, image = cap.read()
    if not success:
        print("Ignoring empty camera frame.")
        continue
    image = cv2.cvtColor(cv2.flip(image, 1), cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = hands.process(image)  # Process the image with MediaPipe Hands
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(
                image,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS,  # Draws lines connecting landmarks
                mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=4), # Landmark style
                mp_drawing.DrawingSpec(color=(255, 0, 0), thickness=2)  # Connection style
            )

    cv2.imshow('MediaPipe Hands', image)
    if cv2.waitKey(5) & 0xFF == 27:  # Press ESC to exit
        break

hands.close()
cap.release()
cv2.destroyAllWindows()