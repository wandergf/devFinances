const Modal = {
    modalOpenClosed() {
        // Abrir e fechar o modal
        document.querySelector('.modal-overlay').classList.toggle('active')
    
        document.querySelector('.error').classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
    },

    set(transactions) {
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        // Somar as entradas
        let income = 0;

        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                // Somar
                income += transaction.amount
            }
        })

        return income;
    },
    expenses() {
        // Somar as saídas
        let expense = 0;

        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                // Somar
                expense += transaction.amount
            }
        })

        return expense;
    },
    total() {
        // Somar o total (entradas - saídas)

        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(trasaction, index) {

        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innertHTMLTransaction(trasaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },
    innertHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>`

        return html
    },

    updateBalance() {
        document.querySelector('#incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.querySelector('#expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.querySelector('#totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ''
    }
}

const Utils = {
    formatAmount(value) {
        value = Number(value.replace(/\,\./g, '')) * 100

        return value
    },

    formatDate(date) {
        const splittedDate = date.split('-')

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : ''

        value = String(value).replace(/\D/g, '')

        value = Number(value) / 100

        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    validateField() {
        const { description, amount, date } = Form.getValues()
        
        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Preencha todos os campos")
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateField()

            const transaction = Form.formatValues()

            Transaction.add(transaction)

            Form.clearFields()
            Modal.modalOpenClosed()

        } catch (error) {
            let erro = document.querySelector('.error')
        
            erro.classList.add('active')
            erro.firstElementChild.innerHTML = error.message
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction);

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()