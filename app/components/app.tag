<app>
  <div class="form-container">
    <form onsubmit={addQuestion}>
      <input type="text" id="newQuestion" class="add-question" value="Ask a question" onfocus={clear}>
    </form>
  </div>
  <div each={obj, i in state.questions} class="item">
    <i class="fa fa-4x fa-arrow-circle-o-up" onclick={handleVote}></i>
    <p class="info">{obj.question}</p>
    <p class="value">{obj.points}</p>
  </div>

  <script>
    let self = this;
    let store = opts.store;
    self.socket = io.connect();

    self.socket.on('question change', function (data) {
      if (data.old_val == null) {
        store.dispatch(opts.questionAdded(data.new_val));
      } else {
        self.state.questions.forEach((question, index) => {
          if (question.id === data.old_val.id) {
            store.dispatch(opts.questionUpvoted(index, data.new_val.id, data.new_val));
          }
        });
      }
    });

    /**
    * @desc hydrate component with data by
    * dispatching an action to our api
    */
    self.on('before-mount', function() {
      self.isThrottled = false;
      self.throttleDuration = 100;
      store.dispatch(opts.fetchQuestions());
    });

    /**
    * @desc sort questions by points after 
    * they are initially loaded
    */
    self.on('mount', function() {
      // self.state.questions.sort(self.comparator);
    });

    /**
    * @desc subscribe to store changes, so after our
    * api call is passed through the reducer and the
    * store state changes, it will be reflected in
    * our component
    */
    store.subscribe(() => {
      self.state = store.getState();
      self.update();
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
      self.upvote(e.item.obj.id, e.item.i);
    }

    /**
    * @desc post to api with id of upvoted question.
    * don't pass immediately through reducers via dispatch.
    * instead wait for change feed action through socket io
    *
    * @param id {String} - id
    * @param index {Int} - index
    */
    self.upvote = (id, index) => {
      opts.upvoteQuestion(id, index);
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
      // if (self.newQuestion.value.length) {
      //   self.socket.emit('new question', payload);
      //   self.newQuestion.value = 'Ask a question';
      // }
      if (self.newQuestion.value.length) {
        opts.addQuestion(payload);
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
