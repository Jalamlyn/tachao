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

### Select 正确用法

```
import {Select, SelectItem, Avatar} from "@nextui-org/react";

export const users = [
  {
    id: 1,
    name: "Tony Reichert",
    role: "CEO",
    team: "Management",
    status: "active",
    age: "29",
    avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/male/1.png",
    email: "tony.reichert@example.com",
  },
  {
    id: 2,
    name: "Zoey Lang",
    role: "Tech Lead",
    team: "Development",
    status: "paused",
    age: "25",
    avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/female/1.png",
    email: "zoey.lang@example.com",
  },
  {
    id: 3,
    name: "Jane Fisher",
    role: "Sr. Dev",
    team: "Development",
    status: "active",
    age: "22",
    avatar: "https://d2u8k2ocievbld.cloudfront.net/memojis/female/2.png",
    email: "jane.fisher@example.com",
  },
];

export default function App() {
  return (
    <Select
      classNames={{
        base: "max-w-xs",
        trigger: "h-12",
      }}
      items={users}
      label="Assigned to"
      labelPlacement="outside"
      placeholder="Select a user"
      renderValue={(items) => {
        return items.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <Avatar
              alt={item.data.name}
              className="flex-shrink-0"
              size="sm"
              src={item.data.avatar}
            />
            <div className="flex flex-col">
              <span>{item.data.name}</span>
              <span className="text-default-500 text-tiny">({item.data.email})</span>
            </div>
          </div>
        ));
      }}
    >
      {(user) => (
        <SelectItem key={user.id} textValue={user.name}>
          <div className="flex gap-2 items-center">
            <Avatar alt={user.name} className="flex-shrink-0" size="sm" src={user.avatar} />
            <div className="flex flex-col">
              <span className="text-small">{user.name}</span>
              <span className="text-tiny text-default-400">{user.email}</span>
            </div>
          </div>
        </SelectItem>
      )}
    </Select>
  );
}
```
