// BUDGET CONTROLLER
const budgetController = (() => {
  const Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  const Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach(e => (sum += e.value));
    data.totals[type] = sum;
  };

  const data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: (type, des, val) => {
      let newItem, id;

      data.allItems[type].length > 0
        ? (id = data.allItems[type][data.allItems[type].length - 1].id + 1)
        : (id = 0);

      // create new item base on 'inc' or 'exp' value
      if (type === "exp") {
        newItem = new Expense(id, des, val);
      } else if (type === "inc") {
        newItem = new Income(id, des, val);
      }
      // push it into data structure
      data.allItems[type].push(newItem);

      // return new element
      return newItem;
    },
    deleteItem: (type, id) => {
      let ids, index;
      // id = 3
      ids = data.allItems[type].map(el => el.id);
      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: () => {
      // calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      // calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spent
      data.totals.inc > 0
        ? (data.percentage = Math.round(
            (data.totals.exp / data.totals.inc) * 100
          ))
        : (data.percentage = -1);
    },
    calculatePercentages: () => {
      data.allItems.exp.forEach(cur => {
        cur.calcPercentage(data.totals.inc);
      });
    },
    getPercetages: () => {
      let allPerc = data.allItems.exp.map(cur => cur.getPercentage());
      return allPerc;
    },
    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },
    testing: () => console.log(data)
  };
})();

// UI CONTROLLER
const UIController = (() => {
  const DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    addBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  const formatNumber = (num, type) => {
    let int;
    /*            
         + or - before Number
        exactly 2 decimal points
        comma separating the thousands 
        
        2310.4567 -> + 2,310.46
        2000 -> 2,000.00
        */
    num = Math.abs(num)
      .toFixed(2)
      .split(".");
    /*               .map((e) => {[
                    e[0].length > 3 
                        ? e[0].substr(0, e[0].length - 3) + ',' 
                          + e[0].substr(e[0].length - 3, 3)
                        : [],
                    e[1]
                ]}) */
    int = num[0];
    if (int.length > 3) {
      int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }
    return (type === "exp" ? "-" : "+") + " " + int + "." + num[1];
  };

  const nodeListForEach = (list, callback) => {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getinput: () => {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // inc + or exp -
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    addListItem: function(obj, type) {
      let html, newHtml;
      // create html string with placeholder text
      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // replace
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // insert the html
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },
    deleteListItem: selectorId => {
      let el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },
    clearFields: () => {
      let fields, fieldArr;

      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );

      fieldArr = Array.prototype.slice.call(fields);

      fieldArr.forEach(e => (e.value = ""));

      fieldArr[0].focus();
    },
    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      obj.percentage > 0
        ? (document.querySelector(DOMstrings.percentageLabel).textContent =
            obj.percentage + "%")
        : (document.querySelector(DOMstrings.percentageLabel).textContent =
            "---");
    },
    displayPercentages: percentage => {
      let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function(current, index) {
        if (percentage[index] > 0) {
          current.textContent = percentage[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },
    displayMonth: () => {
      let now, year, month, months;
      now = new Date();
      month = now.getMonth();
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + " " + year;
    },
    changedType: () => {
      let fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      );
      nodeListForEach(fields, cur => {
        cur.classList.toggle("red-focus");
      });
      document.querySelector(DOMstrings.addBtn).classList.toggle("red");
    },
    getDOMStrings: () => {
      return DOMstrings;
    }
  };
})();

// GENERAL CONTROLLER
const controller = ((budgetCtrl, UICtrl) => {
  const setupEventListeners = () => {
    const DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.addBtn).addEventListener("click", ctrlAddItem);
    document.addEventListener("keyup", event => {
      event.keyCode === 13 || event.which === 13 ? ctrlAddItem() : [];
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  const updatePercentage = () => {
    // calculate percetanges
    budgetCtrl.calculatePercentages();
    // read percentages from the budget controller
    let percentages = budgetCtrl.getPercetages();
    // update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  const updateBudget = function() {
    // calculate the budget
    budgetCtrl.calculateBudget();
    // return the budget
    let budget = budgetCtrl.getBudget();
    // display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  const ctrlAddItem = () => {
    // 1. get the field input data
    let input = UICtrl.getinput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. add the item to the budget controller
      let newItem = budgetCtrl.addItem(
        input.type,
        input.description,
        input.value
      );
      // 3. add the new item to the UI
      UICtrl.addListItem(newItem, input.type);
      // 4. clear the fields
      UICtrl.clearFields();
      // 5. calculate and update budeget
      updateBudget();
      // 6. calculate and update percentages
      updatePercentage();
    }
  };

  const ctrlDeleteItem = event => {
    let itemID, splitID, type, id;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      // inc-1
      splitID = itemID.split("-");
      type = splitID[0];
      id = parseInt(splitID[1]);

      // 1. delete the item from the data structure
      budgetCtrl.deleteItem(type, id);
      // 2. delete the item from the UI
      UICtrl.deleteListItem(itemID);
      // 3. update and show the new budget
      updateBudget();
      // 4. calculate and update percentage
      updatePercentage();
    }
  };

  return {
    init: () => {
      console.log("app started");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
