module.exports = function(grunt) {

    grunt.initConfig({
        concat: {
            options: {
                separator: ';'
            },
            bdspeer: {
                src: ['src/dAmn/peer/*.js'],
                dest: 'dist/bdspeer.js'
            },
            dAmn: {
                src: ['src/dAmn/*.js'],
                dest: 'dist/dAmn.js'
            },
            wsc: {
                src: [
                    'src/base.js',
                    'src/events.js',
                    'src/cryptomd5.js',
                    'src/transport.js',
                    'src/lib.js',
                    'src/middleware.js',
                    'src/storage.js',
                    'src/packet.js',
                    'src/channel.js',
                    'src/messages.js',
                    'src/protocol.js',
                    'src/flow.js',
                    'src/commands.js',
                    'src/autojoin.js',
                    'src/away.js',
                    'src/ignore.js',
                    'src/client.js',
                    'src/wsc.js'
                ],
                dest: 'dist/wsc.js'
            },
            wscdAmn: {
                src: [
                    'src/base.js',
                    'src/events.js',
                    'src/cryptomd5.js',
                    'src/transport.js',
                    'src/lib.js',
                    'src/middleware.js',
                    'src/storage.js',
                    'src/packet.js',
                    'src/channel.js',
                    'src/messages.js',
                    'src/protocol.js',
                    'src/flow.js',
                    'src/commands.js',
                    'src/autojoin.js',
                    'src/away.js',
                    'src/ignore.js',
                    'src/client.js',
                    'dist/dAmn.js',
                    'dist/bdspeer.js',
                    'src/wsc.js'
                ],
                dest: 'dist/wsc.dAmn.js'
            }
        },
        uglify: {
            wsc: {
                src: 'dist/wsc.js',
                dest: 'dist/wsc.min.js'
            },
            wscdAmn: {
                src: 'dist/wsc.dAmn.js',
                dest: 'dist/wsc.dAmn.min.js'
            }
        },
        copy: {
            js: {
                expand: true,
                src: ['dist/*.js'],
                dest: '../../heroku/frogpond/static/csrc/',
                flatten: true
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    //grunt.loadNpmTasks('grunt-contrib-sass');
    //grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    
    grunt.registerTask(
        'default',
        [
            'concat:bdspeer',
            'concat:dAmn',
            'concat:wsc',
            'concat:wscdAmn',
            'uglify',
            'copy'
        ]
    );
    //grunt.registerTask('js', ['concat', 'uglify', 'copy:js']);
    //grunt.registerTask('css', ['sass', 'cssmin', 'copy:css']);

};

