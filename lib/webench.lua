function dirname(str)
  if str:match(".-/.-") then
    local name = string.gsub(str, "(.*/)(.*)", "%1")
    return name
  else
    return ''
  end
end

package.path = package.path .. ";" .. dirname(debug.getinfo(1).short_src) .. "/?.lua"
json = require('json')

paths   = {}
current = 1

init = function(args)
  wrk.init(args)
  local total = 0
  for index, arg in pairs(args) do
    if index > 0 then
      k, v = string.match(arg, ":(%a+)#(.+)")
      if k == 'method' then
        wrk.method = v
      elseif k == 'body' then
        local f = io.open(v, 'r')
        if f then
          wrk.body = f:read('*all')
          f:close()
        else
          io.write("ERROR:".. json.encode({message="Request body not exists"}) .."\n")
          os.exit()
        end
      elseif k == 'header' then
        local f = io.open(v, 'r')
        if f then
          local headers = json.decode(f:read('*all'))
          for header_key, header_value in pairs(headers) do
            wrk.headers[header_key] = header_value
          end
          f:close()
        else
          io.write("ERROR:".. json.encode({message="Request body not exists"}) .."\n")
          os.exit()
        end
      elseif k == 'list' then
        local f = io.open(v, 'r')
        if f then
          while true do
            local line = f:read()
            if line == nil then break end
            table.insert(paths, line)
          end
          f:close()
        else
          io.write("ERROR:".. json.encode({message="List file not found!"}) .."\n")
          os.exit()
        end
      end
    end
  end
end

request = function()
  path = paths[current]
  if current < #paths then
    current = current + 1
  else
    current = 1
  end
  if path then
    return wrk.format(nil, path)
  else
    return wrk.format(nil)
  end
end

response = function(status, headers, body)
  if status > 399 or status < 200 then
    io.write(('RESPONSE:' .. json.encode({status = status, headers = headers})).. "\n")
  end
end

done = function(summary, latency, requests)
  local latency_statics= {min = latency.min, max = latency.max, mean = latency.mean, stdev = latency.stdev, statistics = {}}
  local requests_statics= {min = requests.min, max = requests.max, mean = requests.mean, stdev = requests.stdev, statistics = {}}
  for k, v in pairs({ 50, 90, 99, 99.999 }) do
    n = latency:percentile(v)
    latency_statics['statistics'][v] = n
  end
  for k, v in pairs({ 50, 90, 99, 99.999 }) do
    n = requests:percentile(v)
    requests_statics['statistics'][v] = n
  end
  io.write('DONE:' .. json.encode({summary=summary, latency=latency_statics, requests=requests_statics}) .. "\n")
end
