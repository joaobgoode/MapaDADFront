export default {
  socket: null,

  connect(url) {
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('Conexão WebSocket estabelecida');
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'colorUpdate') {
        console.log('Recebida atualização de cor:', message.data);
      }
      else if (message.type === 'bulkUpdate') {
        console.log('Recebida atualização em massa:', message.data);
      }
      else {
        console.log('Recebida mensagem de tipo desconhecido:', message);
      }
    };

    this.socket.onerror = (error) => {
      console.error('Erro na conexão WebSocket:', error);
    };

    this.socket.onclose = () => {
      console.log('Conexão WebSocket fechada');
    };
  },

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
};
