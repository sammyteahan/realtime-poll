<app>
  <div class="form-container">
    <form onsubmit={addQuestion}>
      <input type="text" id="newQuestion" class="add-question" value="Ask a question" onfocus={clear}>
    </form>
  </div>
  <div each={questions} class="item">
    <i class="fa fa-4x fa-arrow-circle-o-up" onclick={handleVote}></i>
    <p class="info">{question}</p>
    <p class="value">{points}</p>
  </div>

  <script>
    let self = this;

    self.on('before-mount', function() {
      self.socket = io.connect();
      self.isThrottled = false;
      self.throttleDuration = 100;
    });

    /**
    * @desc register socket and load questions
    *
    * We do our socket stuff in here. Not sure how I
    * feel about that yet, but this is just a proof on concept
    */
    self.on('mount', function() {
      self.socket.on('load questions', function (data) {
        self.questions = data;
        self.questions.sort(self.comparator);
        self.update();
      });
      self.socket.on('question change', function (data) {
        if (data.old_val === null) {
          self.questions.push(data.new_val);
          self.update();
        } else {
          self.questions.forEach((question, index) => {
            if (question.id === data.old_val.id) {
              self.questions[index] = data.new_val;
              self.questions.sort(self.comparator);
              self.update();
            }
          });
        }
      });
    });

    /**
    * @desc throttle voting so it can't
    * be abused by a script
    */
    self.handleVote = (e) => {
      if (self.isThrottled) { return; }
      self.isThrottled = true;
      setTimeout(function() {
        self.isThrottled = false;
      }, self.throttleDuration);
      self.upvote(e.item.id);
    }

    /**
    * @desc increment id and emit and action
    *
    * @param event {Event} - Event
    */
    self.upvote = (id) => {
      self.socket.emit('upvote question', id);
    }

    /**
    * @desc clear input field
    */
    self.clear = () => {
      if (self.newQuestion.value === 'Ask a question') {
        self.newQuestion.value = '';
      }
    }

    /**
    * @desc Add a new question
    *
    * @param event {Event} - Event
    */
    self.addQuestion = (e) => {
      let payload = {
        question: self.newQuestion.value,
        points: 1
      }
      if(self.newQuestion.value.length) {
        self.socket.emit('new question', payload);
        self.newQuestion.value = 'Ask a question';
      }
    }

    /**
    * @desc comparator function to sort questions by points value
    *
    * @param a {Object} - question instance
    * @param b {Object} - question instance
    */
    self.comparator = (a, b) => {
      if (a.points < b.points) {
        return 1;
      } else if (a.points > b.points) {
        return -1;
      } else {
        return 0;
      }
    }
  </script>
  <style scope>
    :scoped {}
    .form-container {}
    input[type="text"]{
      border: none;
      border-bottom: solid 3px #c9c9c9;
      color: #585858;
      font-size: 18px;
      margin: 10px 0;
      padding: 10px;
      min-width: 320px;
      transition: border 0.3s;
    }
    input[type="text"]:focus,
    input[type="text"].focus {
      border-bottom: solid 2px #969696;
    }
    .item {
      box-shadow: 0 1px 2px #000;
      display: flex;
      display: -webkit-flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: center;
      margin: 5px 0;
    }
    .info {
      flex: 1;
      flex-grow: 2;
      font-size: 1.5em;
    }
    .value {
      font-size: 1.5em;
      font-weight: 600;
      flex: 1;
      text-align: center;
    }
    i {
      flex: 1;
      cursor: pointer;
      margin: 0 25px;
    }
    i:hover {
      color: #27ae60;
    }
  </style>
</app>
