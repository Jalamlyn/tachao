```jsx
export default function App() {
  return (
    <div className='bg-gradient-to-tr from-[#FFB457] to-[#FF705B] p-6 rounded-lg'>
      {/_ Basic Card _/}
      <Card className='max-w-[400px] mb-6'>
        <CardHeader>
          <h4 className='font-bold text-xl'>Basic Card</h4>
        </CardHeader>
        <CardBody>
          <p>This is a basic card with some text content.</p>
        </CardBody>
        <CardFooter>
          <Button color='primary'>Action</Button>
        </CardFooter>
      </Card>

      {/* Card with Divider */}
      <Card className='max-w-[400px] mb-6'>
        <CardHeader>
          <h4 className='font-bold text-xl'>Card with Divider</h4>
        </CardHeader>
        <CardBody>
          <p>This card has a divider between the header and body.</p>
        </CardBody>
        <CardFooter>
          <Button color='primary'>Action</Button>
        </CardFooter>
      </Card>

      {/* Card with Image */}
      <Card className='max-w-[400px] mb-6'>
        <CardHeader>
          <h4 className='font-bold text-xl'>Card with Image</h4>
        </CardHeader>
        <CardBody>
          <Image src='https://nextui.org/images/card-example-4.jpeg' alt='Card image' width='100%' height='auto' />
        </CardBody>
        <CardFooter>
          <Button color='primary'>Action</Button>
        </CardFooter>
      </Card>

      {/* Blurred Footer Card */}
      <Card isFooterBlurred className='max-w-[400px] mb-6'>
        <CardHeader>
          <h4 className='font-bold text-xl'>Blurred Footer Card</h4>
        </CardHeader>
        <CardBody>
          <p>This card has a blurred footer.</p>
        </CardBody>
        <CardFooter>
          <Button color='primary'>Action</Button>
        </CardFooter>
      </Card>

      {/* Composition Card */}
      <Card className='max-w-[400px] mb-6'>
        <CardHeader>
          <h4 className='font-bold text-xl'>Composition Card</h4>
        </CardHeader>
        <CardBody>
          <p>This card uses other NextUI components inside.</p>
        </CardBody>
        <CardFooter>
          <Button color='primary'>Action</Button>
        </CardFooter>
      </Card>

      {/* Blurred Card */}
      <Card isBlurred className='max-w-[400px] mb-6'>
        <CardHeader>
          <h4 className='font-bold text-xl'>Blurred Card</h4>
        </CardHeader>
        <CardBody>
          <p>This card has a blurred background.</p>
        </CardBody>
        <CardFooter>
          <Button color='primary'>Action</Button>
        </CardFooter>
      </Card>

      {/* Primary Action Card */}
      <Card isPressable onPress={() => alert("Card pressed!")} className='max-w-[400px] mb-6'>
        <CardHeader>
          <h4 className='font-bold text-xl'>Primary Action Card</h4>
        </CardHeader>
        <CardBody>
          <p>This card is pressable and triggers an action.</p>
        </CardBody>
        <CardFooter>
          <Button color='primary'>Action</Button>
        </CardFooter>
      </Card>

      {/* Cover Image Card */}
      <Card className='max-w-[400px] mb-6'>
        <Image
          src='https://nextui.org/images/card-example-4.jpeg'
          alt='Card image'
          width='100%'
          height='auto'
          className='object-cover'
        />
        <CardHeader>
          <h4 className='font-bold text-xl'>Cover Image Card</h4>
        </CardHeader>
        <CardBody>
          <p>This card has an image as the cover.</p>
        </CardBody>
        <CardFooter>
          <Button color='primary'>Action</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
```
