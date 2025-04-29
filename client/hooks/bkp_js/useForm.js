import { useResourceWithStore } from "./useResource";

const toStr = (o) => (o ? JSON.stringify(Object.entries(o).sort()) : "");

const sameObj = (o1, o2) => toStr(o1) === toStr(o2);

const useForm = (resource) => {
  const { form, refresh, select, update, updateForm, destroy } =
    useResourceWithStore(resource);

  return {
    ...form,
    refresh,
    select,
    submit: update,
    evolve: (record) => {
      if (!sameObj(form.record, record)) updateForm({ record });
    },
    destroy,
  };
};

export default useForm;
