  //狀態機:五種遊戲狀態
  const GAME_STATE = {
    FirstCardAwaits: 'FirstCardAwaits',
    SecondCardAwaits: 'SecondCardAwaits',
    CardsMatchFailed: 'CardsMatchFailed',
    CardsMatched: 'CardsMatched',
    GameFinished: 'GameFinished'
  }
  
  const Symbols = [
    //黑桃
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png',
    //紅心
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png',
    //方塊
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png',
    //梅花
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' 
  ]



const view = {
  transformNumber (number) {
  switch (number) {
    case 1:
      return 'A'
    case 11:
      return 'J'
    case 12: 
      return 'Q'
    case 13:
      return 'K'
    default:
      return number
  }
},

 renderTriedTimes(times) {
    document.querySelector('.tried').innerText = `You've tried ${times} times.`
  },
  renderScore(score) {
    document.querySelector('.score').innerText = `Score: ${score}`
  },

// 生成卡片背面圖案
  getCardElement(index) {
    return `
    <div data-index="${index}"class="card back"></div>
    `
  },
// 生成卡片內容：花色,數字
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)//index除以13的餘數＋1
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}" alt="">
      <p>${number}</p>
      `
  },
//翻牌
  flipCards(...cards) {
    //console.log(card)
    //背面點擊翻正面
    cards.map(card => {
       if (card.classList.contains('back')) {
      card.classList.remove('back')
      card.innerHTML = this.getCardContent(Number(card.dataset.index))

      return
    }
    //正面點擊翻背面
    card.classList.add('back')
    card.innerHTML = null
    })
  },
  // 選出＃cards並抽換內容
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('') 
  },
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  wrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), {once: true}) //once:true --> 要求在事件執行一次之後，就要卸載這個監聽器 
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
  
}

const utility = {
  getRandomNumberArray (count) {
    const number  = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number //回傳值
  }
}

//view.displayCards()

const model = {
  revealedCards: [], //暫存牌組，每次翻牌都先把卡片丟進牌組，集滿兩張檢查配對是否成功，檢查完則牌組需要清空
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13 //相同回傳true 不同回傳false
  },

  score: 0,
  triedTimes: 0
}


const controller = {
//定義currentState屬性，標記目前遊戲狀態：還沒翻牌狀態
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  //依照不同遊戲狀態做不同行為
  dispatchCardAction(card) {
    if(!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        //判斷配對是否成功 布林回傳值true or false
        console.log(model.isRevealedCardsMatched())
        if(model.isRevealedCardsMatched()) {
          //配對成功：牌卡變色，維持翻開
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()  
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗：顯示一秒，翻回背面
          this.currentState = GAME_STATE.CardsMatchFailed
          view.wrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    } 
  console.log(controller.currentState)
  console.log(model.revealedCards.map(card => card.dataset.index)) 
  },
  

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
}

controller.generateCards() //取代view.displayCards()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})