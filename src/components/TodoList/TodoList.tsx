import React from 'react';
import { Todo } from '../../Types';
import { FaRegTrashCan } from 'react-icons/fa6';
import styles from './TodoList.module.scss';

interface TodoListProps {
  todos: Todo[];
  toggleCompleted: (
    id: string,
    completed: boolean,
    title: string,
    date: string
  ) => void;
  deleteTodo: (id: string) => void;
  setEditingTodoId: (id: string | null) => void;
  setEditingTitle: (title: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  toggleCompleted,
  deleteTodo,
  setEditingTodoId,
  setEditingTitle,
}) => {
  return (
    <ul className={styles.todoList}>
      {todos.map((todo) => (
        <li key={todo.id} className={styles.todoItem}>
          <div>
            <label>
              <input
                type='checkbox'
                checked={todo.completed}
                onChange={() =>
                  toggleCompleted(
                    todo.id,
                    todo.completed,
                    todo.title,
                    todo.date
                  )
                }
              />
            </label>
          </div>
          <h3
            onClick={() => {
              setEditingTodoId(todo.id);
              setEditingTitle(todo.title);
            }}
          >
            {todo.title}
          </h3>

          <button
            onClick={() => deleteTodo(todo.id)}
            className={styles.deleteButton}
          >
            <FaRegTrashCan />
          </button>
        </li>
      ))}
    </ul>
  );
};

export default TodoList;
