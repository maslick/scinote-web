class RenameDuplicateColumns < ActiveRecord::Migration

  require 'set';

  def up
    # Update duplicate or prohibited column names with extensions 

    Organization.find_each do |org|
      names = Set.new ["Assigned", "Sample name", "Sample type", "Sample group", "Added on", "Added by"]

      CustomField.where(organization: org).find_each do |column|
        if names.include?(column.name)
          name = column.name
          i = 0
          while names.include?(name)
            name = column.name
            i = i+1
            suffix = "(" + i.to_s + ")"
            if (suffix.length + name.length > 50) 
              name = name[0..(49-suffix.length)]
            end
            name = name + suffix
          end
          column.update(name: name);
        end
        names.add(column.name)
      end

    end
  end

  def down
    # We can't really rollback this change
  end
end