import React from 'react';
import styles from './EditTodo.module.scss';

interface EditTodoProps {
  editingTitle: string;
  setEditingTitle: (title: string) => void;
  updateTodoTitle: () => void;
  cancelEdit: () => void;
}

const EditTodo: React.FC<EditTodoProps> = ({
  editingTitle,
  setEditingTitle,
  updateTodoTitle,
  cancelEdit,
}) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.overlayContent}>
        <button className={styles.closeIcon} onClick={cancelEdit}>
          &times;
        </button>
        <h2>Edit Task</h2>
        <input
          type='text'
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          className={styles.editInput}
          placeholder='Task title...'
        />
        <button onClick={updateTodoTitle} className={styles.saveButton}>
          Save
        </button>
      </div>
    </div>
  );
};

export default EditTodo;
