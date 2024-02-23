import { Plus, Search, FileDown, Filter, MoreHorizontal } from 'lucide-react';
import { Header } from './components/header';
import { Tabs } from './components/tabs';
import { Button } from './components/ui/button';
import { Control, Input } from './components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Pagination } from './components/pagination';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useDebounceValue from './hooks/use_debounce_value';

export interface TagResponse {
  first: number
  prev: number | null
  next: number
  last: number
  pages: number
  items: number
  data: Tag[]
}

export interface Tag {
  title: string
  amountOfVideos: number
  id: string
}



export function App() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = searchParams.get('page') ?? 1;
  const urLFilter = searchParams.get('filter') ?? '';

  const [filter, setFilter] = useState(urLFilter);


  const debounceFilter = useDebounceValue(filter, 1000)

  const { data: tagsResponse, isLoading } = useQuery<TagResponse>({
    queryFn: async () => {
      const response = await fetch(`http://localhost:3000/tags?_page=${page}&_per_page=10&title=${urLFilter}`)
      const data = response.json();
      console.log(data)
      return data
    },
    queryKey: ['get-tags', urLFilter, page],
    placeholderData: keepPreviousData
  })

  function handleFilter() {
    setSearchParams(params => {
      params.set('page', '1')
      params.set('filter', filter)
      return params
    })
  }


  if (isLoading) {
    return null
  }

  return (
    <>
      <div className="py-10 space-y-8">
        <div>
          <Header />
          <Tabs />
        </div>
        <main className="max-w-6xl mx-auto space-y-5">
          <div className='flex items-center gap-3'>
            <h1 className="text-xl font-bold">tags</h1>
            <Button variant='primary'>
              <Plus className='size-3' />Create new
            </Button>
          </div>
          <form className='flex items-center justify-between'>
            <div className='flex items-center '>
              <Input variant='filter'>
                <Search className='size-3' />
                <Control placeholder='Search tags...'
                  onChange={e => setFilter(e.target.value)}
                  value={filter}
                />
              </Input>
              <Button onClick={handleFilter}>
                <Filter className='size-3' />
              </Button>
            </div>
            <Button><FileDown className='size-3' />Export</Button>
          </form>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Amount of videos</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tagsResponse?.data.map((tag) => {
                return (
                  <TableRow key={tag.id}>
                    <TableCell></TableCell>
                    <TableCell>
                      <div className='flex flex-col'>
                        <span className='font-medium'>{tag.title}</span>
                        <span className='text-xs text-zinc-500'>{tag.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className='zinc-300'>{tag.amountOfVideos} Videos</TableCell>
                    <TableCell className='text-right'>
                      <Button size='icon'><MoreHorizontal className='size-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {tagsResponse && <Pagination pages={tagsResponse.pages} items={tagsResponse.items} page={Number(page)} />}

        </main>
      </div >
    </>
  )
}