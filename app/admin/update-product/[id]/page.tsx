import UpdateProductForm from "@/components/admin/UpdateProductForm"


const UpdateProduct = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  return (
    <div className="relative flex size-full justify-center">
       <div className="flex gap-4 px-4 flex-col md:w-[512px] py-5 max-w-[960px] flex-1">
          <div className="flex flex-wrap justify-between gap-3 mb-5">
            <h2 className="text-brand-black-text tracking-light text-4xl font-bold leading-tight min-w-72">
              update product
            </h2>
          </div>

          <UpdateProductForm id={id} />
        </div>
    </div>
  )
}

export default UpdateProduct