const Discord = require("discord.js")
const config = require("./config")
const prefix = config.prefix
const ms = require("ms")
const bot = new Discord.Client()


bot.on("ready", async () => {
    console.log(`Bot has started, with ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} guilds.`)
    bot.user.setGame(`${prefix}help | on ${bot.guilds.size} servers`, "https://www.twitch.tv/p4wnyhof")

})

bot.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`)
  })
  
bot.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`)
  })

bot.on('guildMemberAdd', member => {
    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.find('name', 'general')
    // Do nothing if the channel wasn't found on this server
    if (!channel) return
    // Send the message, mentioning the member
    channel.send(`Welcome to the server, ${member}`)
  })
  

bot.on("message", async message => {
    if(message.author.bot) return
    if(!message.content.startsWith(prefix)) return

    let command = message.content.split(" ")[0]
    command = command.slice(prefix.length)

    let args = message.content.split(" ").slice(1)

    if(command === "add"){
        let numArray = args.map(n=> parseInt(n))
        let total = numArray.reduce( (p, c) => p+c)

        message.channel.send(total)

        return
    }

    
    if(command === "tempmute"){
        let tomute = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0])
        if(!tomute) return message.channel.send("You need to mention a user")
        if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You dont have enough permissions")
        let muterole = message.guild.roles.find(`name`, "Zzuber Mute")
        if(!muterole) {
            try {
                role = await message.guild.createRole({
                    name: "Zzuber Mute",
                    color: "#000000",
                    permissions: []
                })

                message.guild.channels.forEach(async (channel, id) => {
                    await channel.overwritePermissions(muterole, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false
                    })
                })
            } catch(e) {
                console.log(e.stack)
            }
        }

        let mutetime = args[1]
        if(!mutetime) return message.reply("You didnt specify a time.")

        await (tomute.addRole(muterole.id))
        message.reply(`<@${tomute.id}> has been muted for ${ms(ms(mutetime))}`)

        setTimeout(function(){
            message.channel.send(`<@${tomute.id}> has been unmuted!`)
            tomute.removeRole(muterole.id)
        }, ms(mutetime))
        
    }

    if(command === "embed"){
        let ttes = args.join(" ")

        let tembed = new Discord.RichEmbed()
        .setDescription(`${message.author.username} says ${ttes}`)
        .setColor("#01ff32")

        message.channel.send(tembed)
    }

    if(command === "unmute"){
        if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You dont have enough permissions")

        let toMute = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0])
        if(!toMute) return message.channel.send("You need to mention a user")

        

        let role = message.guild.roles.find(r => r.name === "Zzuber Mute")
      

        if(!role || !toMute.roles.has(role.id)) return message.channel.send("This user isnt  muted!")

        await toMute.removeRole(role)
        message.channel.send("I have unmuted them.")

        message.delete().catch(O_o=>{})
        return
    }

    if(command === "mute"){
        if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You dont have enough permissions")

        let toMute = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0])
        if(!toMute) return message.channel.send("You need to mention a user")

        if(toMute.id === message.author.id) return message.channel.send("You can not mute yourself")
        if(toMute.highestRole.position >= message.member.highestRole.position) return message.channel.send("You can not mute people with higher or the same role as you.")

        let role = message.guild.roles.find(r => r.name === "Zzuber Mute")
        if(!role) {
            try {
                role = await message.guild.createRole({
                    name: "Zzuber Mute",
                    color: "#01ff32",
                    permissions: []
                })

                message.guild.channels.forEach(async (channel, id) => {
                    await channel.overwritePermissions(role, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false
                    })
                })
            } catch(e) {
                console.log(e.stack)
            }
        }

        if(toMute.roles.has(role.id)) return message.channel.send("This user is already muted!")

        await toMute.addRole(role)
        message.channel.send("I have muted them.")

        message.delete().catch(O_o=>{})
        return
    }


    if(command === "say"){
        message.channel.send(args.join(" "))
    }

})

bot.login(config.token)