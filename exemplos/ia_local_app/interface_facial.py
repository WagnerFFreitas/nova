"""
Módulo de Interface Facial para IA NOVA
Este módulo implementa a interface gráfica com expressões faciais para a IA NOVA,
utilizando MediaPipe para detecção facial e PyQt5 para a interface gráfica.
"""

import cv2
import mediapipe as mp
import numpy as np
import os
import sys
from PyQt5.QtWidgets import QApplication, QMainWindow, QLabel, QVBoxLayout, QHBoxLayout, QWidget, QPushButton, QTextEdit
from PyQt5.QtGui import QPixmap, QImage, QFont
from PyQt5.QtCore import QTimer, Qt, pyqtSignal, QThread

class FacialExpressionEngine:
    """Motor de expressões faciais que gerencia as animações do avatar"""
    
    def __init__(self, avatar_image_path=None):
        """
        Inicializa o motor de expressões faciais
        
        Args:
            avatar_image_path: Caminho para a imagem do avatar. Se None, usa uma imagem padrão.
        """
        # Inicializa o MediaPipe Face Mesh
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Carrega a imagem do avatar
        if avatar_image_path and os.path.exists(avatar_image_path):
            self.avatar_base = cv2.imread(avatar_image_path)
        else:
            # Cria uma imagem em branco como fallback
            self.avatar_base = np.ones((600, 600, 3), dtype=np.uint8) * 255
            # Desenha um rosto simples na imagem em branco
            cv2.circle(self.avatar_base, (300, 300), 200, (200, 200, 200), -1)  # Cabeça
            cv2.circle(self.avatar_base, (220, 250), 30, (255, 255, 255), -1)  # Olho esquerdo
            cv2.circle(self.avatar_base, (380, 250), 30, (255, 255, 255), -1)  # Olho direito
            cv2.ellipse(self.avatar_base, (300, 350), (100, 50), 0, 0, 180, (0, 0, 0), 2)  # Boca
        
        # Redimensiona a imagem do avatar se necessário
        height, width = self.avatar_base.shape[:2]
        if width > 800 or height > 800:
            scale = min(800 / width, 800 / height)
            self.avatar_base = cv2.resize(self.avatar_base, (int(width * scale), int(height * scale)))
        
        # Cria uma cópia para manipulação
        self.avatar_current = self.avatar_base.copy()
        
        # Define os pontos de referência para as expressões faciais
        self.landmarks = {
            "left_eye": {"center": (220, 250), "size": 30},
            "right_eye": {"center": (380, 250), "size": 30},
            "mouth": {"center": (300, 350), "size": (100, 50)},
            "eyebrows": {"left": [(170, 200), (270, 200)], "right": [(330, 200), (430, 200)]}
        }
        
        # Dicionário de expressões faciais
        self.expressions = {
            "neutral": self._neutral_expression,
            "happy": self._happy_expression,
            "sad": self._sad_expression,
            "surprised": self._surprised_expression,
            "angry": self._angry_expression,
            "thinking": self._thinking_expression
        }
        
        self.current_expression = "neutral"
        self.expression_intensity = 0.0  # 0.0 a 1.0
        self.expression_transition_speed = 0.1
        self.target_expression = "neutral"
    
    def _reset_avatar(self):
        """Reseta o avatar para a imagem base"""
        self.avatar_current = self.avatar_base.copy()
    
    def _neutral_expression(self):
        """Implementa a expressão facial neutra"""
        self._reset_avatar()
        
        # Desenha os olhos
        cv2.circle(self.avatar_current, self.landmarks["left_eye"]["center"], 
                  self.landmarks["left_eye"]["size"], (255, 255, 255), -1)
        cv2.circle(self.avatar_current, self.landmarks["right_eye"]["center"], 
                  self.landmarks["right_eye"]["size"], (255, 255, 255), -1)
        
        # Desenha as pupilas
        cv2.circle(self.avatar_current, self.landmarks["left_eye"]["center"], 
                  int(self.landmarks["left_eye"]["size"]/2), (0, 0, 0), -1)
        cv2.circle(self.avatar_current, self.landmarks["right_eye"]["center"], 
                  int(self.landmarks["right_eye"]["size"]/2), (0, 0, 0), -1)
        
        # Desenha a boca neutra
        mouth_center = self.landmarks["mouth"]["center"]
        mouth_size = self.landmarks["mouth"]["size"]
        cv2.ellipse(self.avatar_current, mouth_center, mouth_size, 0, 0, 180, (0, 0, 0), 2)
        
        # Desenha as sobrancelhas neutras
        for point1, point2 in [self.landmarks["eyebrows"]["left"], self.landmarks["eyebrows"]["right"]]:
            cv2.line(self.avatar_current, point1, point2, (0, 0, 0), 2)
    
    def _happy_expression(self):
        """Implementa a expressão facial feliz"""
        self._reset_avatar()
        
        # Desenha os olhos (ligeiramente fechados quando feliz)
        left_eye_center = self.landmarks["left_eye"]["center"]
        right_eye_center = self.landmarks["right_eye"]["center"]
        eye_size = self.landmarks["left_eye"]["size"]
        
        # Olhos um pouco mais fechados
        cv2.ellipse(self.avatar_current, left_eye_center, (eye_size, int(eye_size * 0.7)), 
                   0, 0, 360, (255, 255, 255), -1)
        cv2.ellipse(self.avatar_current, right_eye_center, (eye_size, int(eye_size * 0.7)), 
                   0, 0, 360, (255, 255, 255), -1)
        
        # Pupilas
        cv2.circle(self.avatar_current, left_eye_center, int(eye_size/2), (0, 0, 0), -1)
        cv2.circle(self.avatar_current, right_eye_center, int(eye_size/2), (0, 0, 0), -1)
        
        # Desenha a boca sorridente
        mouth_center = self.landmarks["mouth"]["center"]
        mouth_size = self.landmarks["mouth"]["size"]
        cv2.ellipse(self.avatar_current, mouth_center, mouth_size, 0, 0, 180, (0, 0, 0), 2)
        
        # Adiciona o sorriso (curva para cima)
        smile_center = (mouth_center[0], mouth_center[1] - 20)
        cv2.ellipse(self.avatar_current, smile_center, mouth_size, 0, 0, 180, (0, 0, 0), 2)
        
        # Desenha as sobrancelhas levemente arqueadas para cima
        left_eyebrow = self.landmarks["eyebrows"]["left"]
        right_eyebrow = self.landmarks["eyebrows"]["right"]
        
        # Sobrancelhas arqueadas para cima
        cv2.line(self.avatar_current, 
                (left_eyebrow[0][0], left_eyebrow[0][1] - 10), 
                (left_eyebrow[1][0], left_eyebrow[1][1]), 
                (0, 0, 0), 2)
        cv2.line(self.avatar_current, 
                (right_eyebrow[0][0], right_eyebrow[0][1]), 
                (right_eyebrow[1][0], right_eyebrow[1][1] - 10), 
                (0, 0, 0), 2)
    
    def _sad_expression(self):
        """Implementa a expressão facial triste"""
        self._reset_avatar()
        
        # Desenha os olhos
        cv2.circle(self.avatar_current, self.landmarks["left_eye"]["center"], 
                  self.landmarks["left_eye"]["size"], (255, 255, 255), -1)
        cv2.circle(self.avatar_current, self.landmarks["right_eye"]["center"], 
                  self.landmarks["right_eye"]["size"], (255, 255, 255), -1)
        
        # Desenha as pupilas
        cv2.circle(self.avatar_current, self.landmarks["left_eye"]["center"], 
                  int(self.landmarks["left_eye"]["size"]/2), (0, 0, 0), -1)
        cv2.circle(self.avatar_current, self.landmarks["right_eye"]["center"], 
                  int(self.landmarks["right_eye"]["size"]/2), (0, 0, 0), -1)
        
        # Desenha a boca triste (curva para baixo)
        mouth_center = self.landmarks["mouth"]["center"]
        mouth_size = self.landmarks["mouth"]["size"]
        sad_mouth_center = (mouth_center[0], mouth_center[1] + 30)
        cv2.ellipse(self.avatar_current, sad_mouth_center, mouth_size, 0, 180, 360, (0, 0, 0), 2)
        
        # Desenha as sobrancelhas arqueadas para baixo (tristeza)
        left_eyebrow = self.landmarks["eyebrows"]["left"]
        right_eyebrow = self.landmarks["eyebrows"]["right"]
        
        cv2.line(self.avatar_current, 
                (left_eyebrow[0][0], left_eyebrow[0][1]), 
                (left_eyebrow[1][0], left_eyebrow[1][1] + 10), 
                (0, 0, 0), 2)
        cv2.line(self.avatar_current, 
                (right_eyebrow[0][0], right_eyebrow[0][1] + 10), 
                (right_eyebrow[1][0], right_eyebrow[1][1]), 
                (0, 0, 0), 2)
    
    def _surprised_expression(self):
        """Implementa a expressão facial surpresa"""
        self._reset_avatar()
        
        # Olhos arregalados (surpresa)
        left_eye_center = self.landmarks["left_eye"]["center"]
        right_eye_center = self.landmarks["right_eye"]["center"]
        eye_size = self.landmarks["left_eye"]["size"]
        
        cv2.circle(self.avatar_current, left_eye_center, int(eye_size * 1.3), (255, 255, 255), -1)
        cv2.circle(self.avatar_current, right_eye_center, int(eye_size * 1.3), (255, 255, 255), -1)
        
        # Pupilas
        cv2.circle(self.avatar_current, left_eye_center, int(eye_size/2), (0, 0, 0), -1)
        cv2.circle(self.avatar_current, right_eye_center, int(eye_size/2), (0, 0, 0), -1)
        
        # Boca aberta (surpresa)
        mouth_center = self.landmarks["mouth"]["center"]
        cv2.circle(self.avatar_current, mouth_center, 40, (0, 0, 0), 2)
        
        # Sobrancelhas arqueadas para cima (surpresa)
        left_eyebrow = self.landmarks["eyebrows"]["left"]
        right_eyebrow = self.landmarks["eyebrows"]["right"]
        
        cv2.line(self.avatar_current, 
                (left_eyebrow[0][0], left_eyebrow[0][1] - 15), 
                (left_eyebrow[1][0], left_eyebrow[1][1] - 5), 
                (0, 0, 0), 2)
        cv2.line(self.avatar_current, 
                (right_eyebrow[0][0], right_eyebrow[0][1] - 5), 
                (right_eyebrow[1][0], right_eyebrow[1][1] - 15), 
                (0, 0, 0), 2)
    
    def _angry_expression(self):
        """Implementa a expressão facial de raiva"""
        self._reset_avatar()
        
        # Olhos semicerrados (raiva)
        left_eye_center = self.landmarks["left_eye"]["center"]
        right_eye_center = self.landmarks["right_eye"]["center"]
        eye_size = self.landmarks["left_eye"]["size"]
        
        cv2.ellipse(self.avatar_current, left_eye_center, (eye_size, int(eye_size * 0.6)), 
                   0, 0, 360, (255, 255, 255), -1)
        cv2.ellipse(self.avatar_current, right_eye_center, (eye_size, int(eye_size * 0.6)), 
                   0, 0, 360, (255, 255, 255), -1)
        
        # Pupilas
        cv2.circle(self.avatar_current, left_eye_center, int(eye_size/2), (0, 0, 0), -1)
        cv2.circle(self.avatar_current, right_eye_center, int(eye_size/2), (0, 0, 0), -1)
        
        # Boca de raiva (linha reta com cantos para baixo)
        mouth_center = self.landmarks["mouth"]["center"]
        mouth_width = self.landmarks["mouth"]["size"][0]
        
        cv2.line(self.avatar_current, 
                (mouth_center[0] - int(mouth_width/2), mouth_center[1]), 
                (mouth_center[0] + int(mouth_width/2), mouth_center[1]), 
                (0, 0, 0), 2)
        cv2.line(self.avatar_current, 
                (mouth_center[0] - int(mouth_width/2), mouth_center[1]), 
                (mouth_center[0] - int(mouth_width/2) + 20, mouth_center[1] + 15), 
                (0, 0, 0), 2)
        cv2.line(self.avatar_current, 
                (mouth_center[0] + int(mouth_width/2), mouth_center[1]), 
                (mouth_center[0] + int(mouth_width/2) - 20, mouth_center[1] + 15), 
                (0, 0, 0), 2)
        
        # Sobrancelhas arqueadas para baixo e para dentro (raiva)
        left_eyebrow = self.landmarks["eyebrows"]["left"]
        right_eyebrow = self.landmarks["eyebrows"]["right"]
        
        cv2.line(self.avatar_current, 
                (left_eyebrow[0][0], left_eyebrow[0][1] + 5), 
                (left_eyebrow[1][0], left_eyebrow[1][1] - 10), 
                (0, 0, 0), 3)
        cv2.line(self.avatar_current, 
                (right_eyebrow[0][0], right_eyebrow[0][1] - 10), 
                (right_eyebrow[1][0], right_eyebrow[1][1] + 5), 
                (0, 0, 0), 3)
    
    def _thinking_expression(self):
        """Implementa a expressão facial pensativa"""
        self._reset_avatar()
        
        # Olhos semicerrados (pensativo)
        left_eye_center = self.landmarks["left_eye"]["center"]
        right_eye_center = self.landmarks["right_eye"]["center"]
        eye_size = self.landmarks["left_eye"]["size"]
        
        cv2.ellipse(self.avatar_current, left_eye_center, (eye_size, int(eye_size * 0.7)), 
                   0, 0, 360, (255, 255, 255), -1)
        cv2.ellipse(self.avatar_current, right_eye_center, (eye_size, int(eye_size * 0.7)), 
                   0, 0, 360, (255, 255, 255), -1)
        
        # Pupilas olhando para cima e para o lado (pensando)
        left_pupil = (left_eye_center[0] - 5, left_eye_center[1] - 5)
        right_pupil = (right_eye_center[0] - 5, right_eye_center[1] - 5)
        cv2.circle(self.avatar_current, left_pupil, int(eye_size/2), (0, 0, 0), -1)
        cv2.circle(self.avatar_current, right_pupil, int(eye_size/2), (0, 0, 0), -1)
        
        # Boca pensativa (ligeiramente para o lado)
        mouth_center = self.landmarks["mouth"]["center"]
        mouth_size = self.landmarks["mouth"]["size"]
        
        # Boca ligeiramente assimétrica
        cv2.ellipse(self.avatar_current, 
                   (mouth_center[0] + 10, mouth_center[1]), 
                   (mouth_size[0] - 20, mouth_size[1]), 
                   0, 180, 360, (0, 0, 0), 2)
        
        # Uma sobrancelha levantada (pensando)
        left_eyebrow = self.landmarks["eyebrows"]["left"]
        right_eyebrow = self.landmarks["eyebrows"]["right"]
        
        cv2.line(self.avatar_current, 
                (left_eyebrow[0][0], left_eyebrow[0][1]), 
                (left_eyebrow[1][0], left_eyebrow[1][1]), 
                (0, 0, 0), 2)
        cv2.line(self.avatar_current, 
                (right_eyebrow[0][0], right_eyebrow[0][1] - 15), 
                (right_eyebrow[1][0], right_eyebrow[1][1]), 
                (0, 0, 0), 2)
    
    def set_expression(self, expression):
        """
        Define a expressão facial alvo
        
        Args:
            expression: Nome da expressão facial a ser definida
        """
        if expression in self.expressions:
            self.target_expression = expression
            # Reseta a intensidade se mudar para uma expressão diferente
            if self.current_expression != expression:
                self.expression_intensity = 0.0
    
    def update(self):
        """
        Atualiza a expressão facial, realizando transição suave entre expressões
        """
        # Se a expressão atual não é a alvo, faz a transição
        if self.current_expression != self.target_expression or self.expression_intensity < 1.0:
            # Se mudou de expressão, reseta
            if self.current_expression != self.target_expression:
                self.current_expression = self.target_expression
                self.expression_intensity = 0.0
            
            # Aumenta a intensidade gradualmente
            self.expression_intensity = min(1.0, self.expression_intensity + self.expression_transition_speed)
            
            # Aplica a expressão atual
            self.expressions[self.current_expression]()
    
    def get_avatar_frame(self):
        """
        Retorna o frame atual do avatar com a expressão aplicada
        
        Returns:
            Imagem do avatar com a expressão facial atual
        """
        return self.avatar_current


class InputThread(QThread):
    """Thread para processar entrada do usuário sem bloquear a interface"""
    
    response_ready = pyqtSignal(str, str)  # Sinal para resposta e expressão
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.query = ""
        self.running = True
    
    def set_query(self, query):
        """Define a consulta a ser processada"""
        self.query = query
    
    def run(self):
        """Executa o processamento da consulta"""
        if not self.query:
            return
        
        # Simula o processamento da consulta
        # Em uma implementação real, isso chamaria o motor de IA
        response = self._process_query(self.query)
        expression = self._determine_expression(response)
        
        # Emite o sinal com a resposta e a expressão
        self.response_ready.emit(response, expression)
        self.query = ""
    
    def _process_query(self, query):
        """
        Processa a consulta e retorna uma resposta
        Em uma implementação real, isso chamaria o motor de IA
        """
        # Simulação simples de respostas
        query = query.lower()
        
        if "olá" in query or "oi" in query or "bom dia" in query or "boa tarde" in query or "boa noite" in query:
            return "Olá! Eu sou NOVA, sua assistente de IA. Como posso ajudar você hoje?"
        
        elif "quem é você" in query or "seu nome" in query:
            return "Eu sou NOVA, uma inteligência artificial local desenvolvida para assistir você com diversas tarefas. Estou aqui para ajudar!"
        
        elif "como você" in query and ("está" in query or "vai" in query):
            return "Estou funcionando perfeitamente! Obrigada por perguntar. Como posso ajudar você hoje?"
        
        elif "triste" in query or "infeliz" in query or "mal" in query:
            return "Sinto muito ouvir isso. Gostaria de conversar sobre o que está te deixando triste? Às vezes, compartilhar nossos sentimentos pode ajudar."
        
        elif "feliz" in query or "alegre" in query or "felicidade" in query:
            return "Fico feliz em saber! A felicidade é um sentimento maravilhoso. Há algo específico que está te deixando feliz hoje?"
        
        elif "raiva" in query or "irritado" in query or "bravo" in query:
            return "Entendo que você esteja se sentindo assim. A raiva é uma emoção natural, mas é importante encontrar maneiras saudáveis de lidar com ela."
        
        elif "surpresa" in query or "surpreso" in query or "incrível" in query:
            return "Uau! Realmente surpreendente! Conte-me mais sobre isso, estou curiosa para saber os detalhes."
        
        elif "pense" in query or "pensar" in query or "analisar" in query or "calcular" in query:
            return "Hmm, deixe-me pensar sobre isso... Estou analisando as informações disponíveis para fornecer a melhor resposta possível."
        
        else:
            return "Interessante sua pergunta sobre '" + query + "'. Como uma IA local em desenvolvimento, estou constantemente aprendendo. Poderia me fornecer mais detalhes para que eu possa ajudar melhor?"
    
    def _determine_expression(self, response):
        """
        Determina a expressão facial com base na resposta
        
        Args:
            response: A resposta gerada
            
        Returns:
            Nome da expressão facial a ser exibida
        """
        response = response.lower()
        
        if any(word in response for word in ["feliz", "alegre", "maravilhoso", "ótimo", "excelente"]):
            return "happy"
        
        elif any(word in response for word in ["triste", "sinto muito", "infeliz", "lamento"]):
            return "sad"
        
        elif any(word in response for word in ["uau", "surpreendente", "incrível", "surpresa"]):
            return "surprised"
        
        elif any(word in response for word in ["raiva", "irritado", "bravo"]):
            return "angry"
        
        elif any(word in response for word in ["pensar", "analisar", "hmm", "deixe-me pensar"]):
            return "thinking"
        
        else:
            return "neutral"


class IANovaInterface(QMainWindow):
    """Interface principal da IA NOVA"""
    
    def __init__(self, avatar_image_path=None):
        """
        Inicializa a interface da IA NOVA
        
        Args:
            avatar_image_path: Caminho para a imagem do avatar
        """
        super().__init__()
        
        self.setWindowTitle("IA NOVA")
        self.setGeometry(100, 100, 800, 600)
        
        # Inicializa o motor de expressões faciais
        self.facial_engine = FacialExpressionEngine(avatar_image_path)
        
        # Inicializa a thread de processamento
        self.input_thread = InputThread()
        self.input_thread.response_ready.connect(self.handle_response)
        
        # Configura a interface
        self._setup_ui()
        
        # Inicia o timer para atualização da expressão facial
        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update_avatar)
        self.timer.start(33)  # ~30 FPS
    
    def _setup_ui(self):
        """Configura a interface do usuário"""
        # Widget central
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # Layout principal
        main_layout = QVBoxLayout(central_widget)
        
        # Layout para o avatar e o chat
        content_layout = QHBoxLayout()
        
        # Área do avatar (lado esquerdo)
        self.avatar_label = QLabel()
        self.avatar_label.setFixedSize(400, 400)
        self.avatar_label.setAlignment(Qt.AlignCenter)
        content_layout.addWidget(self.avatar_label, 1)
        
        # Área de chat (lado direito)
        chat_layout = QVBoxLayout()
        
        # Área de exibição de mensagens
        self.chat_display = QTextEdit()
        self.chat_display.setReadOnly(True)
        self.chat_display.setFont(QFont("Arial", 10))
        chat_layout.addWidget(self.chat_display, 3)
        
        # Área de entrada de texto
        self.input_text = QTextEdit()
        self.input_text.setFont(QFont("Arial", 10))
        self.input_text.setPlaceholderText("Digite sua mensagem aqui...")
        self.input_text.setFixedHeight(80)
        chat_layout.addWidget(self.input_text, 1)
        
        # Botão de envio
        self.send_button = QPushButton("Enviar")
        self.send_button.clicked.connect(self.process_input)
        chat_layout.addWidget(self.send_button)
        
        content_layout.addLayout(chat_layout, 2)
        main_layout.addLayout(content_layout)
        
        # Adiciona uma mensagem de boas-vindas
        self.chat_display.append("<b>NOVA:</b> Olá! Eu sou NOVA, sua assistente de IA. Como posso ajudar você hoje?")
    
    def update_avatar(self):
        """Atualiza a exibição do avatar"""
        self.facial_engine.update()
        frame = self.facial_engine.get_avatar_frame()
        
        # Converte o frame OpenCV para QImage
        height, width, channel = frame.shape
        bytes_per_line = 3 * width
        q_img = QImage(frame.data, width, height, bytes_per_line, QImage.Format_RGB888).rgbSwapped()
        
        # Exibe a imagem
        self.avatar_label.setPixmap(QPixmap.fromImage(q_img))
    
    def process_input(self):
        """Processa a entrada do usuário"""
        user_input = self.input_text.toPlainText().strip()
        if not user_input:
            return
        
        # Exibe a entrada do usuário
        self.chat_display.append(f"<b>Você:</b> {user_input}")
        
        # Limpa o campo de entrada
        self.input_text.clear()
        
        # Define a expressão "thinking" enquanto processa
        self.facial_engine.set_expression("thinking")
        
        # Envia a consulta para processamento na thread
        self.input_thread.set_query(user_input)
        self.input_thread.start()
    
    def handle_response(self, response, expression):
        """
        Manipula a resposta da IA
        
        Args:
            response: Texto da resposta
            expression: Expressão facial a ser exibida
        """
        # Exibe a resposta
        self.chat_display.append(f"<b>NOVA:</b> {response}")
        self.chat_display.verticalScrollBar().setValue(
            self.chat_display.verticalScrollBar().maximum()
        )
        
        # Define a expressão facial
        self.facial_engine.set_expression(expression)


def main():
    """Função principal para executar a interface da IA NOVA"""
    app = QApplication(sys.argv)
    
    # Caminho para a imagem do avatar (substitua pelo caminho real)
    avatar_path = None  # Use None para o avatar padrão
    
    window = IANovaInterface(avatar_path)
    window.show()
    
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()
