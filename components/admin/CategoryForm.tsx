

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '../ui/button';

// Form ma'lumotlari uchun interface
interface CategoryFormData {
  name: string;
  description: string;
}

// Component props interface
interface CategoryFormProps {
  mode: 'add' | 'update';
  initialData?: CategoryFormData;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || ''
    },
    mode: 'onChange' // real-time validation uchun
  });

  const onSubmitHandler: SubmitHandler<CategoryFormData> = (data) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <form 
      className="flex flex-col gap-4 md:w-[512px] py-5 max-w-[960px] flex-1 px-4"
      onSubmit={handleSubmit(onSubmitHandler)}
    >
      <div className="flex flex-wrap justify-between gap-3 mb-5">
        <h2 className="text-brand-black-text tracking-light text-4xl font-bold leading-tight min-w-72">
          {mode === 'add' ? 'Add Category' : 'Update Category'}
        </h2>
      </div>

      <div className="flex max-w-[480px] flex-wrap items-end gap-4">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-brand-black-text text-base font-medium leading-normal pb-2">
            Category name*
          </p>
          <input
            placeholder="Enter category name"
            className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-14 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal ${
              errors.name ? 'border-2 border-red-500' : ''
            }`}
            {...register('name', {
              required: 'Category name is required',
              minLength: {
                value: 2,
                message: 'Category name must be at least 2 characters'
              }
            })}
          />
          {errors.name && (
            <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>
          )}
        </label>
      </div>

      <div className="flex max-w-[480px] flex-wrap items-end gap-4">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-brand-black-text text-base font-medium leading-normal pb-2">
            Description
          </p>
          <textarea
            placeholder="Enter category description"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none min-h-36 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal"
            {...register('description')}
          />
        </label>
      </div>

      <div className="flex flex-1 gap-3 flex-wrap justify-end">
        <Button
          type="button"
          variant="secondary"
          className="bg-[#e7edf3] rounded-xl h-10 px-4 cursor-pointer text-sm font-bold leading-normal tracking-[0.015em]"
          onClick={handleCancel}
          disabled={isLoading}
        >
          <span className="truncate">Cancel</span>
        </Button>
        <Button
          type="submit"
          variant="default"
          className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-black text-white text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50"
          disabled={!isValid || isLoading}
        >
          {isLoading ? (
            <span>Loading...</span>
          ) : (
            <span>{mode === 'add' ? 'Add category' : 'Update category'}</span>
          )}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
