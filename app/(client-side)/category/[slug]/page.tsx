import CategoryContent from '@/components/client/CategoryContent'

const Category = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const {slug} = await params

  return (
    <>
      <CategoryContent slug={slug} />
    </>
  )
}

export default Category