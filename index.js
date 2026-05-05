function createElement(tag, attributes, children, callbacks) {
    const element = document.createElement(tag);

    if (attributes) {
        Object.keys(attributes).forEach((key) => {
            const value = attributes[key];

            if (value === false || value === null || value === undefined) {
                return;
            }

            if (key === "checked" || key === "value") {
                element[key] = value;
            } else {
                element.setAttribute(key, value);
            }
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
            element.addEventListener(callback.eventType, callback.listener);
        });
    } else if (callbacks) {
        element.addEventListener(callbacks.eventType, callbacks.listener);
    }

    return element;
}

class Component {
    constructor() {}

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

class AddTask extends Component {
    constructor({ labelText, onAddTask, onAddInputChange }) {
        super();

        this.state = {
            labelText,
            onAddTask,
            onAddInputChange,
        };
    }

    render() {
        return createElement("div", { class: "add-todo" }, [
            createElement("input", {
                id: "new-todo",
                type: "text",
                placeholder: "Задание",
                value: this.state.labelText,
            }, [], {
                eventType: "input",
                listener: this.state.onAddInputChange,
            }),

            createElement("button", { id: "add-btn" }, "+", {
                eventType: "click",
                listener: this.state.onAddTask,
            }),
        ]);
    }
}

class Task extends Component {
    constructor({ todo, index, onDelete, onComplete }) {
        super();

        this.state = {
            todo,
            index,
            onDelete,
            onComplete,
        };
    }

    render() {
        return createElement("li", {}, [
            createElement("input", {
                type: "checkbox",
                checked: this.state.todo.completed,
            }, [], {
                eventType: "change",
                listener: (e) => this.state.onComplete(this.state.index, e.target.checked),
            }),

            createElement("label", {
                style: this.state.todo.completed
                    ? "color: gray;"
                    : "",
            }, this.state.todo.label),

            createElement("button", {}, "🗑️", {
                eventType: "click",
                listener: () => this.state.onDelete(this.state.index),
            }),
        ]);
    }
}

class TodoList extends Component {
    constructor() {
        super();

        this.state = {
            labelText: "",
            todos: [
                { label: "Сделать домашку", completed: false },
                { label: "Сделать практику", completed: false },
                { label: "Пойти домой", completed: false },
            ],
        };
    }

    onAddTask = () => {
        const text = this.state.labelText.trim();

        if (text) {
            this.state.todos.push({
                label: text,
                completed: false,
            });

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
        return createElement("div", { class: "todo-list" }, [
            createElement("h1", {}, "TODO List"),

            new AddTask({
                labelText: this.state.labelText,
                onAddTask: this.onAddTask,
                onAddInputChange: this.onAddInputChange,
            }).getDomNode(),

            createElement("ul", { id: "todos" },
                this.state.todos.map((todo, index) => {
                    return new Task({
                        todo,
                        index,
                        onDelete: this.onDelete,
                        onComplete: this.onComplete,
                    }).getDomNode();
                })
            ),
        ]);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(new TodoList().getDomNode());
});