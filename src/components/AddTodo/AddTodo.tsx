import React from 'react';
import styles from './AddTodo.module.scss'; 

interface AddTodoProps {
  newTodoTitle: string;
  setNewTodoTitle: (title: string) => void;
  createTodo: () => void;
}

const AddTodo: React.FC<AddTodoProps> = ({
  newTodoTitle,
  setNewTodoTitle,
  createTodo,
}) => {
  return (
    <div className={styles.addTodo}>
      <input
        type="text"
        value={newTodoTitle}
        onChange={(e) => setNewTodoTitle(e.target.value)}
        className={styles.inputField}
        placeholder="Create new task"
      />
      <button onClick={createTodo} className={styles.addButton}>
        Add
      </button>
    </div>
  );
};

export default AddTodo;
