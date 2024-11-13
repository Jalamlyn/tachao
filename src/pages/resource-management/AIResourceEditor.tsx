// ... 前面的代码保持不变直到 ResizablePanel defaultSize={70} ...

          <ResizablePanel defaultSize={70} className='resizable-panel bg-slate-50'>
            <div className='h-full overflow-auto'>
              {currentPreview ? (
                <div className='h-full flex flex-col'>
                  {/* 预览区域 */}
                  <div className='flex-1 p-4 bg-white rounded-lg'>
                    {currentPreview.preview}
                  </div>
                  
                  {/* 代码区域 */}
                  <div className='flex-1 mt-4 p-4 bg-gray-50 rounded-lg'>
                    <pre className='text-sm overflow-auto'>
                      <code>{currentPreview.content}</code>
                    </pre>
                  </div>
                </div>
              ) : resourceData ? (
                <div className='bg-white rounded-lg shadow'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((column) => (
                          <TableHead className='min-w-24 bg-slate-50' key={column.accessorKey}>
                            {column.header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resourceData.map((row: any, rowIndex: number) => (
                        <TableRow key={rowIndex}>
                          {columns.map((column) => (
                            <TableCell key={`${rowIndex}-${column.accessorKey}`}>{row[column.accessorKey]}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className='text-center py-12 text-gray-500 h-full flex flex-col justify-center items-center'>
                  <Icon icon='mdi:loading' className='w-12 h-12 mx-auto mb-4' />
                  <p>正在加载数据...</p>
                </div>
              )}
            </div>
          </ResizablePanel>

// ... 后面的代码保持不变 ...