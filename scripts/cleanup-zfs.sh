#!/usr/bin/env fish

# Script to clean up unused and unmounted ZFS snapshots and clones from tank pool

echo "Starting ZFS cleanup for tank pool..."

# Function to check if a dataset is mounted
function is_mounted
    set dataset $argv[1]
    set mounted (zfs get -H -o value mounted $dataset 2>/dev/null)
    test "$mounted" = "yes"
end

# Function to check if a dataset has dependents
function has_dependents
    set dataset $argv[1]
    set deps (zfs list -H -o name -r $dataset 2>/dev/null | tail -n +2)
    test -n "$deps"
end

# Clean up clones
echo "Looking for unmounted clones..."
for clone in (zfs list -H -o name -t filesystem | grep "^tank/ci-.*-clone-")
    if not is_mounted $clone
        echo "Found unmounted clone: $clone"
        
        # Check if clone has any dependents
        if has_dependents $clone
            echo "  ⚠️  Clone has dependents, skipping: $clone"
        else
            echo "  🗑️  Destroying clone: $clone"
            zfs destroy -r $clone
            and echo "  ✅ Destroyed: $clone"
            or echo "  ❌ Failed to destroy: $clone"
        end
    else
        echo "  ℹ️  Clone is mounted, keeping: $clone"
    end
end

# Clean up snapshots
echo ""
echo "Looking for snapshots..."
for snapshot in (zfs list -H -o name -t snapshot | grep "^tank/.*@ci-")
    echo "Found CI snapshot: $snapshot"
    
    # Check if snapshot has clones
    set clones (zfs get -H -o value clones $snapshot 2>/dev/null)
    if test "$clones" != "-"
        echo "  ⚠️  Snapshot has clones, skipping: $snapshot"
    else
        echo "  🗑️  Destroying snapshot: $snapshot"
        zfs destroy $snapshot
        and echo "  ✅ Destroyed: $snapshot"
        or echo "  ❌ Failed to destroy: $snapshot"
    end
end

# Show current state
echo ""
echo "Current tank pool CI-related datasets:"
zfs list -t all | head -1
zfs list -t all | grep "tank/ci-" || echo "No CI datasets found"

echo ""
echo "Cleanup complete!"