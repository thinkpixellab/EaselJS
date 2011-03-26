require 'rubygems'
require 'bundler'
Bundler.setup

require 'rack-rewrite'
require 'rack/contrib'

run Rack::Directory.new(Dir.pwd)
