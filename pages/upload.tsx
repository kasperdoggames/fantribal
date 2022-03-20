import { Web3Storage } from 'web3.storage'

const Upload = () => {
  const handleOnSubmit = async (e: any) => {
    e.preventDefault()
    console.log(e.target[0].files[0])
    const result = await saveToIpfs(e.target[0].files[0])
    console.log(result)
  }

  async function saveToIpfs(
    file: File
  ): Promise<{ uri: string; hash: string }> {
    const client = new Web3Storage({
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDdBQzQ0NkYwMWZEZTRjYTk2YTc3QTFBNTIzRGFBNjZENzkxY2Y1NTYiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NDUwNTYyOTEyMDcsIm5hbWUiOiJkb2dmb29kMjAifQ.8DTGJ9yJk8c5PVjRn3685YITkJeTVGX8CpYx9jOLKcE',
    })
    const cid = await client.put([file], { wrapWithDirectory: false })
    return { uri: `https://${cid}.ipfs.dweb.link`, hash: cid.toString() }
  }

  return (
    <>
      <form onSubmit={handleOnSubmit}>
        <label>Upload file:</label>
        <input name="imageFile" type="file"></input>
        <input type="submit"></input>
      </form>
    </>
  )
}

export default Upload
