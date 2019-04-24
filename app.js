
// Budget Controller
var budgetController = (function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var allExpenses = [];
    var allIncomes = [];
    var totalExpenses = 0;

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc:0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, desc, val){
            var newItem, ID;

            // Create a new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            

            // Create a new item based on 'Inc' or 'Exp' type
            if(type === 'exp'){
                newItem = new Expense(ID, desc, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, desc, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);
            // Return the new element   
            return newItem;  
        },

        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1 ){
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // Calculate the budget: income - expanses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if(data.totals.inc > 0) {
                data.percentage = Math.floor((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentage: function() {

            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }
    };
    
})();

// UI Controller

var UIController = (function(){
    
    var DOMstrings = {
        inputType:  '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        budgetIncome: '.budget__income--value',
        budgetExpenses: '.budget__expenses--value',
        budgetPercentage: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',

    };

            var formatNumber =  function(num, type) {
                var numSplit, int, dec, type;
                /**
                 * + or - before Number
                 * 2 decimal points
                 * comma separating the thousands
                 * 
                 * ex: 2534.5155 -> 2,534.56 
                 */

                num = Math.abs(num);
                num = num.toFixed(2);

                numSplit = num.split('.');

                int = numSplit[0];
                    if(int.length > 3) {
                        int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
                    }

                dec = numSplit[1];

                return (type === 'exp' ?  '-' : '+') + ' ' + int + '.' + dec
            };
        return {
            getInput: function() {
                return {
                    type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                    description: document.querySelector(DOMstrings.inputDescription).value,
                    value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
                };
            },

            addListItem: function(obj, type) {
                var html, newHtml, element;
                // Create HTML string with placeholder text
                if(type === 'inc') {
                    element = DOMstrings.incomeContainer;
                    html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div></div>';
                } else if(type === 'exp'){

                    element = DOMstrings.expensesContainer;
                    html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }

                // Replace the placeholder text with some actual data

                newHtml = html.replace('%id%', obj.id);
                newHtml = newHtml.replace('%description%', obj.description);
                newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
                // Insert the HTML int the DOM

                document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            },

            deleteListItem: function(selectorID) {
                var el;
                el =  document.getElementById(selectorID);
                el.parentNode.removeChild(el);
            },

            clearFields: function() {
                var fields, fieldsArray;
                fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

                fieldsArray = Array.prototype.slice.call(fields);

                fieldsArray.forEach(function(current, index, array){
                    current.value = "";
                });
                
                fieldsArray[0].focus();
            },

            displayBudget: function(obj) {
                var type;
                obj.budget > 0 ? type = 'inc' : type = 'exp';

                document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
                document.querySelector(DOMstrings.budgetIncome).textContent = formatNumber(obj.totalInc, 'inc');
                document.querySelector(DOMstrings.budgetExpenses).textContent = formatNumber(obj.totalExp, 'exp');

                if(DOMstrings.budgetPercentage > 0) {
                    document.querySelector(DOMstrings.budgetPercentage).textContent = obj.percentage + '%';
                } else {
                    document.querySelector(DOMstrings.budgetPercentage).textContent = '---';
                }
            },

            displayPercentages: function(percentages){
                var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

                var nodeListForEach = function(list, callback){
                    for(i = 0; i < list.length; i++){
                        callback(list[i], i);
                    }
                };

                nodeListForEach(fields, function(current, index){

                    if(percentages[index] > 0) {
                        current.textContent = percentages[index] + '%';
                    } else {
                        current.textContent = '---';
                    }

                });
            },

            getDOMstrings: function(){
                return DOMstrings;
            }
        };
})();

// Global App Controller
var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            
            if( event.keyCode === 13 || event.which === 13 ) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    }



    var ctrlAddItem = function() {

        var updateBudget = function() {

            // 1. Calculate the Budget
            budgetCtrl.calculateBudget();

            // 2. return the Budget
            var budget = budgetCtrl.getBudget();

            // 3. Display the Budget on the ui
            UICtrl.displayBudget(budget);

            };

        var updatePercentages = function() {

            // 1. calculate percentages
            budgetCtrl.calculatePercentage();

            // 2. Read percentages from the budget controller
            var percentages = budgetCtrl.getPercentages();

            // 3. Update the UI with the new percentages
            UICtrl.displayPercentages(percentages);

        }; 

        var input, newItem;
        // 1. Get the field input data.
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
        // 2. Add the item to budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        // 3. Add the item to the UI
        UICtrl.addListItem(newItem, input.type);

        // 4. Clear Field
        UICtrl.clearFields();

        // 5. Calculate and Update the Budget
        updateBudget();

        // 6. Calculate and update percentages
        updatePercentages();

        }
    };

    var ctrlDeleteItem = function(event) {

        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function() {
            console.log('App is started');
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