/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { customAxios } from '../../api';
import TodoList from '../../components/TodoList/TodoList';
import AddTodo from '../../components/AddTodo/AddTodo';
import EditTodo from '../../components/EditTodo/EditTodo';
import styles from './HomePage.module.scss';

const fetchTodos = async ({ pageParam = 0 }: { pageParam?: number }) => {
  const limit = 20;
  const sort = 'date';
  const order = 'desc';
  const response = await customAxios.get('/todos/scroll', {
    params: { nextCursor: pageParam, limit, sort, order },
  });
  return response.data;
};

const HomePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [newTodoTitle, setNewTodoTitle] = useState<string>('');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? false,
    initialPageParam: 0,
  });

  const createTodoMutation = useMutation({
    mutationFn: (newTodo: { title: string; completed: boolean }) => {
      console.log('Adding todo:', newTodo);
      return customAxios.post('/todos', newTodo);
    },
    onSuccess: () => {
      console.log('Todo added successfully');
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setNewTodoTitle('');
    },
    onError: (error) => {
      console.error('Failed to add todo:', error);
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: (todo: {
      id: string;
      title: string;
      completed: boolean;
      date: string;
    }) => {
      return customAxios.put(`/todos/${todo.id}`, todo);
    },
    onMutate: async (updatedTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      const previousTodos = queryClient.getQueryData(['todos']);

      queryClient.setQueryData(['todos'], (oldData: any) => ({
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          todos: page.todos.map((todo: any) =>
            todo.id === updatedTodo.id ? { ...todo, ...updatedTodo } : todo
          ),
        })),
      }));

      return { previousTodos };
    },
    onError: (err, _updatedTodo, context: any) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
      console.error('Failed to update todo:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (id: string) => {
      console.log('Deleting todo with ID:', id);
      return customAxios.delete(`/todos/${id}`);
    },
    onSuccess: () => {
      console.log('Todo deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (
      target.scrollHeight - target.scrollTop === target.clientHeight &&
      hasNextPage
    ) {
      fetchNextPage();
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Let&apos;s Get Things Done!</h1>
      <h1 className={styles.subtitle}>One Step Closer to Your Goals</h1>

      <div className={styles.todoWrapper} onScroll={handleScroll}>
        <AddTodo
          newTodoTitle={newTodoTitle}
          setNewTodoTitle={setNewTodoTitle}
          createTodo={() =>
            createTodoMutation.mutate({
              title: newTodoTitle.trim(),
              completed: false,
            })
          }
        />

        {isLoading && (
          <div className={styles.loaderWrapper}>
            <div className={styles.circularLoader}></div>
          </div>
        )}
        {isError && <p>Error: {(error as any)?.message}</p>}

        {data?.pages.map((page, i) => (
          <React.Fragment key={i}>
            <TodoList
              todos={page.todos}
              toggleCompleted={(id, completed, title, date) =>
                updateTodoMutation.mutate({
                  id,
                  title,
                  completed: !completed,
                  date,
                })
              }
              deleteTodo={(id) => deleteTodoMutation.mutate(id)}
              setEditingTodoId={setEditingTodoId}
              setEditingTitle={setEditingTitle}
            />
          </React.Fragment>
        ))}

        {isFetchingNextPage && (
          <div className={styles.loaderWrapper}>
            <div className={styles.circularLoader}></div>
          </div>
        )}
        {!hasNextPage && !isLoading && <p>No more todos available.</p>}
      </div>

      {editingTodoId && (
        <EditTodo
          editingTitle={editingTitle}
          setEditingTitle={setEditingTitle}
          updateTodoTitle={() => {
            const todoToUpdate = data?.pages
              .flatMap((page) => page.todos)
              .find((todo) => todo.id === editingTodoId);

            if (todoToUpdate) {
              updateTodoMutation.mutate(
                {
                  id: todoToUpdate.id,
                  title: editingTitle,
                  completed: todoToUpdate.completed,
                  date: todoToUpdate.date,
                },
                {
                  onSuccess: () => {
                    setEditingTodoId(null);
                  },
                }
              );
            }
          }}
          cancelEdit={() => setEditingTodoId(null)}
        />
      )}
    </div>
  );
};

export default HomePage;
