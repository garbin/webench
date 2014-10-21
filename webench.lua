init = function(args)
    wrk.init(args)
    if args[2] then
        local f = io.open(args[2], 'rb')
        wrk.body = f:read("*all")
        io.write(wrk.body)
        f:close()
    end
end
