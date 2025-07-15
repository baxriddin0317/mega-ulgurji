import ProductContent from "@/components/contents/ProductContent"

const Product = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const {slug} = await params

  return (
    <>
      <ProductContent slug={slug} />
    </>
  )
}

export default Product