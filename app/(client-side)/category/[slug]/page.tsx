import CategoryContent from "@/components/contents/CategoryContent"

const Category = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const {slug} = await params

  return (
    <>
      <CategoryContent slug={slug} />
    </>
  )
}

export default Category