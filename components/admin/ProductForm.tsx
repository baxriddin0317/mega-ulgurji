import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CgClose } from 'react-icons/cg';
import { GrGallery } from 'react-icons/gr';
import Image from 'next/image';

// Form validation schema
const productSchema = z.object({
  title: z.string().min(1, 'Product name is required'),
  price: z.string().min(1, 'Price is required'),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  isBest: z.boolean(),
  isNew: z.boolean(),
  quantity: z.number().min(0),
  productImageUrl: z.array(z.any()).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  submitButtonText?: string;
  title?: string;
  isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitButtonText = 'Add product',
  title = 'Add Product',
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: initialData?.title || '',
      price: initialData?.price || '',
      category: initialData?.category || '',
      subCategory: initialData?.subCategory || '',
      description: initialData?.description || '',
      isBest: initialData?.isBest || false,
      isNew: initialData?.isNew || false,
      quantity: initialData?.quantity || 0,
      productImageUrl: initialData?.productImageUrl || [],
    },
  });

  const watchedImages = watch('productImageUrl');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Handle file upload logic here
      // Convert to your ImageT format and update form
      console.log('Files selected:', files);
    }
  };

  const removeImage = (index: number) => {
    const currentImages = watchedImages || [];
    const updatedImages = currentImages.filter((_, i) => i !== index);
    setValue('productImageUrl', updatedImages);
  };

  return (
    <form 
      className="flex gap-4 px-4 flex-col md:w-[512px] py-5 max-w-[960px] flex-1"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-wrap justify-between gap-3 mb-5">
        <h2 className="text-brand-black-text tracking-light text-4xl font-bold leading-tight min-w-72">
          {title}
        </h2>
      </div>

      {/* Upload Image */}
      <div className='flex items-center gap-x-4'>
        {watchedImages && watchedImages.length > 0 && (
          <div className='size-28 relative overflow-hidden rounded-2xl'>
            <Image 
              className='absolute size-full object-cover' 
              src="https://picsum.photos/200/300" 
              fill 
              alt="product image" 
            />
            <Button 
              type='button' 
              className='absolute top-2 right-2 cursor-pointer z-10 bg-white size-6' 
              variant={'ghost'}
              onClick={() => removeImage(0)}
            >
              <CgClose size={12} />
            </Button>
          </div>
        )}
        <label 
          className='flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all h-9 px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 cursor-pointer' 
          htmlFor='upload'
        >
          <GrGallery />
          <span>Upload img</span>
        </label>
        <input 
          className='sr-only' 
          id='upload' 
          type="file" 
          onChange={handleFileUpload}
          accept="image/*"
        />
      </div>

      {/* Product Name */}
      <div className="flex max-w-[480px] flex-wrap items-end gap-4">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-brand-black-text text-base font-medium leading-normal pb-2">
            Product name*
          </p>
          <input
            placeholder="Enter product name"
            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none !h-10 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal"
            {...register('title')}
          />
          {errors.title && (
            <span className="text-red-500 text-sm mt-1">{errors.title.message}</span>
          )}
        </label>
      </div>

      {/* Category */}
      <div className="flex max-w-[480px] flex-wrap items-end gap-4">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">
            Select a category*
          </p>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none !max-h-[53px] placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal cursor-pointer">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <span className="text-red-500 text-sm mt-1">{errors.category.message}</span>
          )}
        </label>
      </div>

      {/* Price */}
      <div className="flex max-w-[480px] flex-wrap items-end gap-4">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-brand-black-text text-base font-medium leading-normal pb-2">
            Price*
          </p>
          <input
            placeholder="$0.00"
            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none !h-10 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal"
            {...register('price')}
          />
          {errors.price && (
            <span className="text-red-500 text-sm mt-1">{errors.price.message}</span>
          )}
        </label>
      </div>

      {/* Description */}
      <div className="flex max-w-[480px] flex-wrap items-end gap-4">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-brand-black-text text-base font-medium leading-normal pb-2">
            Description*
          </p>
          <textarea
            placeholder="Enter product description"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none min-h-36 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal"
            {...register('description')}
          />
          {errors.description && (
            <span className="text-red-500 text-sm mt-1">{errors.description.message}</span>
          )}
        </label>
      </div>

      {/* Product Checkboxes */}
      <div className="flex items-start divide-x-2 gap-4 mb-3">
        <div className='pr-4'>
          <span className="block text-brand-black-text text-base font-medium leading-normal pb-2">
            Best Product
          </span>
          <Controller
            name="isBest"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
        <div className="pl-4">
          <span className="block text-brand-black-text text-base font-medium leading-normal pb-2">
            New Product
          </span>
          <Controller
            name="isNew"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-1 gap-3 flex-wrap justify-end">
        <Button
          type='button'
          variant={'secondary'}
          className="bg-[#e7edf3] rounded-xl h-10 px-4 cursor-pointer text-sm font-bold leading-normal tracking-[0.015em]"
          onClick={onCancel}
          disabled={isLoading}
        >
          <span className="truncate">Cancel</span>
        </Button>
        <Button
          type='submit'
          variant={'default'}
          className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-black text-white text-sm font-bold leading-normal tracking-[0.015em]"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : submitButtonText}
        </Button>
      </div>
    </form>
  );
};