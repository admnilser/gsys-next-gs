import useFormInputs from "./useFormInputs";

const useListInputs = (input, list) => {
  const { handleFormat, handleInputChange, handleChange, handleDelete } = input;

  const inputs = useFormInputs({}, handleInputChange);

  const insertItem = () => {
    const item = inputs.values;

    handleChange([handleFormat ? handleFormat(item) : item, ...(list || [])]);

    inputs.reset();
  };

  const deleteItem = (e) =>
    handleDelete &&
    handleChange(handleDelete(list, parseInt(e.currentTarget.id)));

  return { inputs, insertItem, deleteItem };
};

export default useListInputs;
