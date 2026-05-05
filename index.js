function createElement(tag, attributes, children, callbacks) {
    const element = document.createElement(tag);

    if (attributes) {
        Object.keys(attributes).forEach((key) => {
            element.setAttribute(key, attributes[key]);
        });
    }

    if (Array.isArray(children)) {
        children.forEach((child) => {
            if (typeof child === "string") {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
    } else if (typeof children === "string") {
        element.appendChild(document.createTextNode(children));
    } else if (children instanceof HTMLElement) {
        element.appendChild(children);
    }

    if (Array.isArray(callbacks)) {
        callbacks.forEach((callback) => {
            element.addEventListener(callback.eventType, callback.listener)
        });
    } else if (callbacks) {
        element.addEventListener(callbacks.eventType, callbacks.listener)
    }

    return element;
}

class Component {
    constructor() {
    }

    getDomNode() {
        this._domNode = this.render();
        return this._domNode;
    }

    update() {
        const newDomNode = this.render();
        if (this._domNode && this._domNode.parentNode) {
            this._domNode.parentNode.replaceChild(newDomNode, this._domNode);
        }
        this._domNode = newDomNode;
    }
}

class Task extends Component {
    constructor({todo, index, onDelete, onComplete}) {
        super();
        this.state = {
            todo, index, onDelete, onComplete,
        }
    }

    render() {
        return createElement("li", {}, [
            createElement("input", {type: "checkbox"}, [], {
            eventType: "click", listener: () => this.state.onComplete(this.state.index)
        }), createElement("label", {
            style: this.state.todo.completed ? "color: gray" : ""
        }, this.state.todo.label),
            createElement("button", {}, "🗑️", {
            eventType: "click", listener: () => this.state.onDelete(this.state.index)
        }),])
    }
}

class TodoList extends Component {

    constructor() {
        super();

        this.state = {
            labelText: "", todos: [{label: "Сделать домашку"}, {label: "Сделать практику"}, {label: "Пойти домой"},],
        };
    }

    onAddTask = () => {
        if (this.state.labelText.trim()) {
            this.state.todos.push({label: this.state.labelText});
            this.state.labelText = "";
            this.update();
        }
    };

    onAddInputChange = (e) => {
        this.state.labelText = e.target.value;
    };

    onDelete = (index) => {
      this.state.todos.splice(index, 1);
      this.update();
    };

    onComplete = (index, checked) => {
      this.state.todos[index].completed = checked;
      this.update();
    };

    render() {
        return createElement("div", {class: "todo-list"}, [createElement("h1", {}, "TODO List"), createElement("div", {class: "add-todo"}, [createElement("input", {
            id: "new-todo", type: "text", placeholder: "Задание",
        }, [], {
            eventType: "input", listener: this.onAddInputChange
        }), createElement("button", {id: "add-btn"}, "+", {
            eventType: "click", listener: this.onAddTask
        }),]), createElement("ul", {id: "todos"}, this.state.todos.map((todo, index,) => {
            return new Task({todo, index, onDelete : this.onDelete, onComplete : this.onComplete}).getDomNode();
        })),]);
    }

}

document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(new TodoList().getDomNode());
});
