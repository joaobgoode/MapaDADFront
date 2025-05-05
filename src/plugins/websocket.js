import { store } from '../store/store.js'
export default {
  socket: null,
  messageHandler: null,
  connect(url) {
    if (this.socket) {
      this.disconnect();
    }
    this.socket = new WebSocket(url);
    this.socket.onopen = () => {
      console.log('Conexão WebSocket estabelecida');
    };
    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'colorUpdate') {
          //console.log('Recebida atualização de cor:', message.data);
          const { space, date, hour, color } = message.data
          const [ano, mes, dia] = date.split("T")[0].split("-").map(Number);
          const day = new Date(ano, mes - 1, dia)
          const area = store.getRegisteredTextArea(space, day, hour)
          if (area) {
            //console.log('Área encontrada:', area);
            area.color = color
          }
        }
        else if (message.type === 'bulkUpdate') {
          //console.log('Recebida atualização em massa:', message.data);
          for (const item of message.data) {
            const { space, date, hour, client } = item
            const day = new Date(date)
            const area = store.getRegisteredTextArea(space, day, hour)
            if (area) {
              area.text = client
            }
          }
        }
        else {
          console.log('Recebida mensagem de tipo desconhecido:', message);
        }
        if (this.messageHandler && typeof this.messageHandler === 'function') {
          this.messageHandler(message);
        }
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error);
      }
    };
    this.socket.onerror = (error) => {
      console.error('Erro na conexão WebSocket:', error);
    };
    this.socket.onclose = () => {
      console.log('Conexão WebSocket fechada');
    };
    return this.socket;
  },
  setMessageHandler(handler) {
    if (typeof handler === 'function') {
      this.messageHandler = handler;
    } else {
      console.error('O handler de mensagens deve ser uma função');
    }
  },
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.messageHandler = null;
    }
  },
  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error('WebSocket não está conectado');
    }
  }
};
