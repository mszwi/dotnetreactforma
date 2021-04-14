using DotnetReactFoma.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace DotnetReactFoma.Models
{
    public class ApplicationUser : IdentityUser
    {
        [JsonPropertyName("displayName")]
        public string DisplayName { get; set; }

        /*[JsonPropertyName("connectionId")]
        public string ConnectionId { get; set; }*/

        [JsonPropertyName("status")]
        public UserStatus Status { get; set; }

        [JsonPropertyName("type")]
        public UserType Type { get; set; }

        [JsonPropertyName("contactMethod")]
        public ContactMethodType ContactMethod { get; set; }

        [JsonPropertyName("contactSubject")]
        public ContactSubject ContactSubject { get; set; }

        [JsonPropertyName("wherebyLink")]
        public string WherebyLink { get; set; }
      
    }


    public enum UserStatus
    {
        Available, Busy, Offline
    }

    public enum UserType
    {
        Admin, User
    }

    public enum ContactSubject
    {
        Undefined, TechnicalSupport, CustomerService
    }

    public enum ContactMethodType
    {
        Undefined, Video, Phone, Message
    }
    public class PasswordlessLoginTotpTokenProvider<TUser> : TotpSecurityStampBasedTokenProvider<TUser>
    where TUser : class
    {
        public override Task<bool> CanGenerateTwoFactorTokenAsync(UserManager<TUser> manager, TUser user)
        {
            return Task.FromResult(false);
        }

        public override async Task<string> GetUserModifierAsync(string purpose, UserManager<TUser> manager, TUser user)
        {
            var email = await manager.GetEmailAsync(user);
            return "PasswordlessLogin:" + purpose + ":" + email;
        }
    }
    public static class CustomIdentityBuilderExtensions
    {
        public static IdentityBuilder AddPasswordlessLoginTotpTokenProvider(this IdentityBuilder builder)
        {
            var userType = builder.UserType;
            var totpProvider = typeof(PasswordlessLoginTotpTokenProvider<>).MakeGenericType(userType);
            return builder.AddTokenProvider("PasswordlessLoginTotpProvider", totpProvider);
        }
    }


}
